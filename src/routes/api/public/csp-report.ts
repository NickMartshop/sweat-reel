import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_REPORTS = 10;

const ALLOWED_CONTENT_TYPES = new Set([
  "application/csp-report",
  "application/reports+json",
]);

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Sanitize the blocked URI.
 * Only accept http: and https: protocols.
 * Return only the URL origin.
 * Reject ftp:, file:, javascript: and other protocols.
 * Never log paths, credentials, query strings, or fragments.
 */
function sanitizeBlockedUri(uri: string | null | undefined): string {
  if (!uri) return "null";
  try {
    const u = new URL(uri);
    // Only accept http: and https: protocols
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return "non-url";
    }
    // Return only the origin (protocol + host + port), no path, query, or fragment
    return u.origin;
  } catch {
    return "non-url";
  }
}

/**
 * Sanitize a CSP directive.
 * Use the correct word-character regular expression /[^\w-]/g.
 * Limit output to 128 characters.
 */
function sanitizeDirective(directive: string | null | undefined): string {
  if (!directive) return "null";
  const sanitized = directive.replace(/[^\w-]/g, "_");
  return sanitized.length > 128 ? sanitized.slice(0, 128) : sanitized;
}

const logger = (directive: string, disposition: string, blockedOrigin: string) => {
  console.error(
    `[csp-report] directive=${directive} disposition=${disposition} blocked_origin=${blockedOrigin}`,
  );
};

/** Normalized report shape */
interface NormalizedReport {
  violatedDirective: string;
  disposition: string;
  blockedUri: string;
}

/**
 * Normalize a legacy CSP report object ({ violated-directive, effective-directive,
 * blocked-uri, disposition }).
 * - Require an object under "csp-report".
 * - Reject null and arrays.
 * - Read "violated-directive", "effective-directive", "blocked-uri", and "disposition".
 * - Normalize to common internal report structure.
 * - Disposition allows only "report" and "enforce"; all other values become "unknown".
 * Return null if the report is invalid.
 */
function normalizeLegacyReport(r: Record<string, unknown>): NormalizedReport | null {
  // Reject null and arrays
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;

  // r is already the csp-report object from the parsed payload
  // Read fields with validation - never access before validating
  const violatedDirective = r["violated-directive"] as string | undefined;
  const effectiveDirective = r["effective-directive"] as string | undefined;
  const blockedUri = r["blocked-uri"] as string | undefined;
  const disposition = r["disposition"] as string | undefined;

  // All required fields must be present non-empty strings
  if (
    typeof violatedDirective !== "string" ||
    typeof effectiveDirective !== "string" ||
    typeof blockedUri !== "string" ||
    typeof disposition !== "string"
  )
    return null;

  // Disposition allows only "report" and "enforce"; all other values become "unknown"
  const normalizedDisposition =
    disposition === "report" || disposition === "enforce" ? disposition : "unknown";

  return {
    violatedDirective,
    disposition: normalizedDisposition,
    blockedUri,
  };
}

/**
 * Normalize a modern Reporting API report object.
 * - Require "type === "csp-violation"".
 * - Require "body" to be a non-null, non-array object.
 * - Read "body.effectiveDirective", "body.blockedURL", and "body.disposition".
 * - Normalize to common internal report structure.
 * Return null if the report is invalid.
 */
function normalizeModernReport(r: Record<string, unknown>): NormalizedReport | null {
  // Require type === "csp-violation"
  if (r["type"] !== "csp-violation" || typeof r["type"] !== "string") return null;

  const body = r["body"];
  // Require "body" to be a non-null, non-array object
  if (body === null || typeof body !== "object" || Array.isArray(body)) return null;

  const bodyObj = body as Record<string, unknown>;

  // Read fields with validation - never access before validating
  const effectiveDirective = bodyObj["effectiveDirective"] as string | undefined;
  const blockedURL = bodyObj["blockedURL"] as string | undefined;
  const disposition = bodyObj["disposition"] as string | undefined;

  // All required fields must be present non-empty strings
  if (
    typeof effectiveDirective !== "string" ||
    typeof blockedURL !== "string" ||
    typeof disposition !== "string"
  )
    return null;

  const normalizedDisposition =
    disposition === "report" || disposition === "enforce" ? disposition : "unknown";

  return {
    violatedDirective: effectiveDirective,
    disposition: normalizedDisposition,
    blockedUri: blockedURL,
  };
}

/**
 * Validate Content-Length using a strict non-negative safe integer check.
 * Do not rely only on parseInt().
 */
export function validateContentLength(
  contentLength: string | null,
): { valid: boolean; bytes: number } | null {
  if (contentLength === null) {
    // Content-Length header may be absent; proceed to read body
    return null;
  }

  const cl = contentLength.trim();

  // Must match a non-empty sequence of digits
  if (!/^\d+$/.test(cl)) {
    return { valid: false, bytes: -1 };
  }

  // Strict safe integer check: must be a non-negative safe integer
  const clNum = Number(cl);
  if (!Number.isSafeInteger(clNum) || clNum < 0) {
    return { valid: false, bytes: -1 };
  }

  // Must not exceed MAX_BODY_BYTES
  if (clNum > MAX_BODY_BYTES) {
    return { valid: false, bytes: -1 };
  }

  return { valid: true, bytes: clNum };
}

export async function handleCspReport(request: Request, injectedLogger: typeof logger) {
  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";")[0].trim().toLowerCase();

  if (!ALLOWED_CONTENT_TYPES.has(mediaType)) {
    return jsonError("unsupported_media_type", 415);
  }

  if (!request.body) {
    return jsonError("invalid_request", 400);
  }

  // Validate Content-Length using strict check; if absent, proceed to read body
  const contentLength = request.headers.get("content-length");
  const clResult = contentLength != null ? validateContentLength(contentLength) : null;

  if (clResult && clResult.valid === false) {
    return jsonError("request_entity_too_large", 413);
  }

  const chunks: Uint8Array[] = [];
  let bytesRead = 0;

  const reader = request.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (clResult && bytesRead + value.length > MAX_BODY_BYTES) {
        await reader.cancel();
        return jsonError("request_entity_too_large", 413);
      }
      if (bytesRead + value.length > MAX_BODY_BYTES) {
        await reader.cancel();
        return jsonError("request_entity_too_large", 413);
      }
      chunks.push(value);
      bytesRead += value.length;
    }
  } catch (e) {
    return jsonError("invalid_request", 400);
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
    let violatedDirective: string;
    let disposition: string;
    let blockedUri: string;

    if (mediaType === "application/csp-report") {
      // Legacy format fields: "violated-directive", "effective-directive", "blocked-uri", "disposition"
      const normalized = normalizeLegacyReport(r);
      if (normalized === null) {
        return jsonError("invalid_request", 400);
      }
      violatedDirective = normalized.violatedDirective;
      disposition = normalized.disposition;
      blockedUri = normalized.blockedUri;
    } else {
      // Modern format: nested body object
      const normalized = normalizeModernReport(r);
      if (normalized === null) {
        return jsonError("invalid_request", 400);
      }
      violatedDirective = normalized.violatedDirective;
      disposition = normalized.disposition;
      blockedUri = normalized.blockedUri;
    }

    // Prevent newline/control-character log injection
    const safeDirective = sanitizeDirective(violatedDirective).replace(/[\n\r\t]/g, " ");
    const safeDisposition = disposition.replace(/[\n\r\t]/g, " ");
    const safeBlockedOrigin = sanitizeBlockedUri(blockedUri).replace(/[\n\r\t]/g, " ");

    injectedLogger(safeDirective, safeDisposition, safeBlockedOrigin);

    // Allowlist disposition values: report, enforce; otherwise unknown
    if (safeDisposition !== "report" && safeDisposition !== "enforce") {
      // disposition already defaults to "unknown" in normalize functions
    }
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
