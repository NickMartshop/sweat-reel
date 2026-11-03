import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_REPORTS = 10;

const ALLOWED_CONTENT_TYPES = new Set(["application/csp-report", "application/reports+json"]);

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
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
  const sanitized = directive.replace(/[^\\w-]/g, "_");
  return sanitized.length > 128 ? sanitized.slice(0, 128) : sanitized;
}

const logger = (directive: string, disposition: string, blockedOrigin: string) => {
  console.error(
    `[csp-report] directive=${directive} disposition=${disposition} blocked_origin=${blockedOrigin}`,
  );
};

export async function handleCspReport(request: Request, injectedLogger: typeof logger) {
  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";")[0].trim().toLowerCase();

  if (!ALLOWED_CONTENT_TYPES.has(mediaType)) {
    return jsonError("unsupported_media_type", 415);
  }

  if (!request.body) {
    return jsonError("invalid_request", 400);
  }

  // Strictly validate Content-Length header; do not accept malformed values through parseInt
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const cl = contentLength.trim();
    if (!/^\d+$/.test(cl)) {
      return jsonError("invalid_request", 400);
    }
    if (parseInt(cl, 10) > MAX_BODY_BYTES) {
      return jsonError("request_entity_too_large", 413);
    }
  }

  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  const cancelled = false;

  const reader = request.body.getReader();
  try {
    while (true) {
      if (cancelled) {
        return jsonError("request_entity_too_large", 413);
      }
      const { done, value } = await reader.read();
      if (done) break;
      if (bytesRead + value.length > MAX_BODY_BYTES) {
        reader.cancel();
        return jsonError("request_entity_too_large", 413);
      }
      chunks.push(value);
      bytesRead += value.length;
    }
  } catch (e) {
    return jsonError("invalid_request", 400);
  } finally {
    reader.cancel();
  }

  if (bytesRead === 0) {
    return jsonError("invalid_request", 400);
  }

  let raw;
  try {
    raw = new TextDecoder("utf-8", { fatal: true }).decode(
      (() => {
        const u8 = new Uint8Array(bytesRead);
        let offset = 0;
        for (const chunk of chunks) {
          u8.set(chunk, offset);
          offset += chunk.length;
        }
        return u8;
      })(),
    );
  } catch (e) {
    return jsonError("invalid_request", 400);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return jsonError("invalid_request", 400);
  }

  let reports: Array<Record<string, unknown>> = [];

  if (mediaType === "application/csp-report") {
    // Legacy CSP format: { "csp-report": {...} }
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("csp-report" in parsed) ||
      parsed["csp-report"] === null ||
      typeof parsed["csp-report"] !== "object"
    ) {
      return jsonError("invalid_request", 400);
    }
    const report = parsed["csp-report"] as Record<string, unknown>;
    if (!Array.isArray(report)) {
      reports = [report];
    } else {
      reports = report;
    }
  } else {
    // Modern Reporting API format: application/reports+json
    // Array of report objects containing type: "csp-violation" and a body object
    if (!Array.isArray(parsed)) {
      return jsonError("invalid_request", 400);
    }
    // Validate count before processing
    if (parsed.length < 1 || parsed.length > MAX_REPORTS) {
      return jsonError("invalid_request", 400);
    }
    // Validate each report has type: "csp-violation"
    for (const r of parsed) {
      if (
        !r ||
        typeof r !== "object" ||
        (r as Record<string, unknown>)["type"] !== "csp-violation"
      ) {
        return jsonError("invalid_request", 400);
      }
    }
    reports = parsed as Array<Record<string, unknown>>;
  }

  // Reject more than 10; never silently truncate using slice()
  if (reports.length > MAX_REPORTS) {
    return jsonError("invalid_request", 400);
  }

  for (const r of reports) {
    const violatedDirective = sanitizeDirective(
      String(r["violated-directive"] ?? r["effective-directive"] ?? ""),
    );

    // Allowlist disposition values: report, enforce; otherwise unknown
    let disposition = String(r["disposition"] ?? "unknown");
    if (disposition !== "report" && disposition !== "enforce") {
      disposition = "unknown";
    }

    // For blocked URLs, log only a validated HTTP(S) origin; never log paths, query strings, credentials, or fragments
    const blockedUri = String(r["blocked-uri"] ?? "");
    const blockedOrigin = sanitizeBlockedUri(blockedUri);

    // Prevent newline/control-character log injection
    const safeDirective = violatedDirective.replace(/[\n\r\t]/g, " ");
    const safeDisposition = disposition.replace(/[\n\r\t]/g, " ");
    const safeBlockedOrigin = blockedOrigin.replace(/[\n\r\t]/g, " ");

    injectedLogger(safeDirective, safeDisposition, safeBlockedOrigin);
  }

  return new Response(null, { status: 204 });
}

export const Route = createFileRoute("/api/public/csp-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return handleCspReport(request, logger);
      },
    },
  },
});
