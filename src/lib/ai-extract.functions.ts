import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(500),
  note: z.string().max(120).optional(),
});

export const extractExercises = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ title: z.string().min(1).max(300) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI not configured");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are a fitness coach. Based only on this workout title: "${data.title}", create a realistic exercise list. Return ONLY a valid JSON array, no explanation, no markdown, no backticks. Use this exact format: [{"name": "Exercise Name", "sets": 3, "reps": 12}]. For cardio/yoga: use {"name": "Exercise", "sets": 1, "reps": 1, "note": "20 mins"}. Give 4-7 exercises maximum. Be realistic for the muscle group implied in the title.`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt,
      temperature: 0.3,
    });

    const cleaned = text.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    const json = match ? match[0] : cleaned;
    const parsed = JSON.parse(json);
    const arr = z.array(ExerciseSchema).min(1).max(10).parse(parsed);
    return { exercises: arr };
  });
