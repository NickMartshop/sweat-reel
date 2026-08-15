import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/workout-preview")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { preflight } = await import("@/lib/native-api.server");
        return preflight();
      },
      POST: async ({ request }) => {
        const { jsonError, jsonResponse, parseWorkoutUrl, buildPreview } = await import(
          "@/lib/native-api.server"
        );

        let url: unknown;
        try {
          url = ((await request.json()) as { url?: unknown }).url;
        } catch {
          return jsonError("invalid_request", 400, "Expected JSON body { url }");
        }

        if (typeof url !== "string" || url.length === 0 || url.length > 2000) {
          return jsonError("invalid_request", 400, "Expected a url string");
        }

        const parsed = parseWorkoutUrl(url);
        if (!parsed) {
          return jsonError(
            "unsupported_url",
            400,
            "Only YouTube, Instagram and TikTok links are supported",
          );
        }

        try {
          return jsonResponse(await buildPreview(parsed));
        } catch {
          console.error("[workout-preview] preview lookup failed");
          return jsonError("preview_failed", 502, "Could not fetch preview for this link");
        }
      },
    },
  },
});
