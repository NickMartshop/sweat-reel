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
          .select("is_premium, premium_expires_at, ai_extractions_used, ai_extractions_count")
          .eq("id", userId)
          .maybeSingle();
        if (profErr || !prof) return jsonError("profile_not_found", 404);

        const p = prof as any;
        const premiumActive =
          !!p.is_premium &&
          (!p.premium_expires_at || new Date(p.premium_expires_at) > new Date());
        const used: number = p.ai_extractions_used ?? 0;

        if (!premiumActive && used >= 3) {
          return jsonError(
            "quota_exceeded",
            402,
            "Free plan allows 3 AI extractions. Upgrade to Pro for unlimited access.",
          );
        }

        // Reserve quota atomically before the AI call.
        if (!premiumActive) {
          const { data: reserved, error: resErr } = await supabase
            .from("profiles")
            .update({ ai_extractions_used: used + 1 } as any)
            .eq("id", userId)
            .lt("ai_extractions_used", 3)
            .select("id");
          if (resErr || !reserved || reserved.length === 0) {
            return jsonError(
              "quota_exceeded",
              402,
              "Free plan allows 3 AI extractions. Upgrade to Pro for unlimited access.",
            );
          }
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return jsonError("ai_unavailable", 503, "AI is not configured");

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
          if (!premiumActive) {
            try {
              await supabase
                .from("profiles")
                .update({ ai_extractions_used: used } as any)
                .eq("id", userId);
            } catch {
              /* non-fatal */
            }
          }
          return jsonError("ai_failed", 502, "Could not generate exercises. Please try again.");
        }

        try {
          await supabase
            .from("profiles")
            .update({ ai_extractions_count: (p.ai_extractions_count ?? 0) + 1 } as any)
            .eq("id", userId);
        } catch {
          /* non-fatal */
        }

        return jsonResponse({ exercises });
      },
    },
  },
});
