import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";


const ExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(500),
  note: z.string().max(120).optional(),
});

export const extractExercises = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])

  .inputValidator((input: unknown) =>
    z
      .object({ title: z.string().min(1).max(300) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Server-side quota enforcement. Do NOT trust the client to gate this —
    // the free tier allows 3 AI extractions total; premium is unlimited.
    const { data: prof, error: profErr } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("id", context.userId)
      .maybeSingle();
    if (profErr || !prof) throw new Error("Profile not found");
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI not configured");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reservation, error: reserveError } = await supabaseAdmin.rpc(
      "reserve_ai_extraction_v2",
      { _user_id: context.userId },
    );
    if (reserveError) throw new Error("Could not check AI extraction access");
    if (reservation === -1) {
      throw new Error("AI extraction quota exceeded. Upgrade to Pro for unlimited access.");
    }

    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are a fitness coach. Based only on this workout title: "${data.title}", create a realistic exercise list. Return ONLY a valid JSON array, no explanation, no markdown, no backticks. Use this exact format: [{"name": "Exercise Name", "sets": 3, "reps": 12}]. For cardio/yoga: use {"name": "Exercise", "sets": 1, "reps": 1, "note": "20 mins"}. Give 4-7 exercises maximum. Be realistic for the muscle group implied in the title.`;

    let arr;
    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
        temperature: 0.3,
      });
      const cleaned = text.replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      const json = match ? match[0] : cleaned;
      const parsed = JSON.parse(json);
      arr = z.array(ExerciseSchema).min(1).max(10).parse(parsed);
    } catch (err) {
      // Refund the reserved quota on failure so users aren't charged for errors.
      if (reservation === 1) {
        await supabaseAdmin.rpc("release_ai_extraction_v2", { _user_id: context.userId });
      }
      throw err;
    }

    // Lifetime achievement counter (separate from quota).
    await supabaseAdmin.rpc("record_ai_extraction_success", { _user_id: context.userId });

    return { exercises: arr };
  });
