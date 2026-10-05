import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/ai-extract-exercises")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { preflight } = await import("@/lib/native-api.server");
        return preflight();
      },
      POST: async ({ request }) => {
        const {
          authenticateRequest,
          jsonError,
          jsonResponse,
          ExtractRequestSchema,
          buildExtractPrompt,
          parseExercises,
        } = await import("@/lib/native-api.server");

        const auth = await authenticateRequest(request);
        if ("error" in auth) return auth.error;
        const { supabase, userId } = auth;

        let input;
        try {
          input = ExtractRequestSchema.parse(await request.json());
        } catch {
          return jsonError("invalid_request", 400, "Expected { title, url?, platform? }");
        }

        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
        if (profErr || !prof) return jsonError("profile_not_found", 404);

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return jsonError("ai_unavailable", 503, "AI is not configured");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: reservation, error: reserveError } = await supabaseAdmin.rpc(
          "reserve_ai_extraction_v2",
          { _user_id: userId },
        );
        if (reserveError) return jsonError("quota_check_failed", 503);
        if (reservation === -1) {
          return jsonError(
            "quota_exceeded",
            402,
            "Free plan allows 3 AI extractions. Upgrade to Pro for unlimited access.",
          );
        }

        let exercises;
        try {
          const { generateText } = await import("ai");
          const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
          const gateway = createLovableAiGatewayProvider(key);
          const { text } = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            prompt: buildExtractPrompt(input.title),
            temperature: 0.3,
          });
          exercises = parseExercises(text);
        } catch (err) {
          console.error("[ai-extract-exercises] generation failed");
          if (reservation === 1) {
            await supabaseAdmin.rpc("release_ai_extraction_v2", { _user_id: userId });
          }
          return jsonError("ai_failed", 502, "Could not generate exercises. Please try again.");
        }

        await supabaseAdmin.rpc("record_ai_extraction_success", { _user_id: userId });

        return jsonResponse({ exercises });
      },
    },
  },
});
