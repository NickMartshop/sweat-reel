import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_REPORTS = 10;

const ALLOWED_CONTENT_TYPES = new Set(["application/csp-report", "application/json"]);

function jsonError(error: string, status: number, message?: string) {
  return new Response(JSON.stringify(message ? { error, message } : { error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sanitizeBlockedUri(uri: string | null | undefined): string {
  if (!uri) return "null";
  try {
    const u = new URL(uri);
    return u.origin;
  } catch {
    return "non-url";
  }
}

function sanitizeDirective(directive: string | null | undefined): string {
  if (!directive) return "null";
  return directive.replace(/[^\w-]/g, "_");
}

export const Route = createFileRoute("/api/public/csp-report")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "content-type",
            "Access-Control-Max-Age": "86400",
          },
        });
      },
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? "";
        const mediaType = contentType.split(";")[0].trim().toLowerCase();

        if (!ALLOWED_CONTENT_TYPES.has(mediaType)) {
          return jsonError(
            "unsupported_media_type",
            415,
            "Expected application/csp-report or application/json",
          );
        }

        const body = await request
          .arrayBuffer()
          .catch(() => jsonError("invalid_request", 400, "Unable to read body"));

        if (body instanceof Response) return body;

        if (body.byteLength > MAX_BODY_BYTES) {
          return jsonError("request_entity_too_large", 413, `Body exceeds ${MAX_BODY_BYTES} bytes`);
        }

        let raw: string;
        try {
          raw = new TextDecoder().decode(body);
        } catch {
          return jsonError("invalid_request", 400, "Body is not valid UTF-8");
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return jsonError("invalid_request", 400, "Body is not valid JSON");
        }

        const report =
          parsed && typeof parsed === "object" && "csp-report" in parsed
            ? (parsed as { "csp-report": unknown })["csp-report"]
            : parsed;

        if (!report || typeof report !== "object") {
          return jsonError("invalid_request", 400, "Missing csp-report object");
        }

        const reportObj = report as Record<string, unknown>;
        const reports = Array.isArray(reportObj) ? reportObj.slice(0, MAX_REPORTS) : [reportObj];

        if (reports.length === 0 || reports.length > MAX_REPORTS) {
          return jsonError("invalid_request", 400, `Expected 1 to ${MAX_REPORTS} report(s)`);
        }

        for (const r of reports) {
          const violatedDirective = sanitizeDirective(
            String(r["violated-directive"] ?? r["effective-directive"] ?? ""),
          );
          const disposition = String(r["disposition"] ?? "unknown");
          const blockedOrigin = sanitizeBlockedUri(String(r["blocked-uri"] ?? ""));
          // Log only sanitized directive, disposition, and blocked origin.
          // Never log full URLs, document URIs, query strings, script samples,
          // tokens, or personal information.
          console.error(
            `[csp-report] directive=${violatedDirective} disposition=${disposition} blocked_origin=${blockedOrigin}`,
          );
        }

        return new Response(null, { status: 204 });
      },
    },
  },
});
