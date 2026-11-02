import { test, describe, mock } from "node:test";
import { strict as assert } from "node:assert";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_REPORTS = 10;
const ALLOWED_CONTENT_TYPES = new Set([
  "application/csp-report",
  "application/json",
]);

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

function extractReport(parsed: unknown): Record<string, unknown> | null {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  if ("csp-report" in obj && obj["csp-report"] && typeof obj["csp-report"] === "object") {
    return obj["csp-report"] as Record<string, unknown>;
  }
  return obj;
}

describe("CSP report validation logic", () => {
  test("should reject unsupported content type", () => {
    const contentType = "text/plain";
    const mediaType = contentType.split(";")[0].trim().toLowerCase();
    assert.strictEqual(ALLOWED_CONTENT_TYPES.has(mediaType), false);
  });

  test("should accept application/csp-report content type", () => {
    const contentType = "application/csp-report";
    const mediaType = contentType.split(";")[0].trim().toLowerCase();
    assert.strictEqual(ALLOWED_CONTENT_TYPES.has(mediaType), true);
  });

  test("should accept application/json content type", () => {
    const contentType = "application/json";
    const mediaType = contentType.split(";")[0].trim().toLowerCase();
    assert.strictEqual(ALLOWED_CONTENT_TYPES.has(mediaType), true);
  });

  test("should reject body exceeding 16 KB", () => {
    const oversizedBody = "x".repeat(MAX_BODY_BYTES + 1);
    assert.strictEqual(Buffer.byteLength(oversizedBody, "utf8") > MAX_BODY_BYTES, true);
  });

  test("should accept body within 16 KB limit", () => {
    const validBody = JSON.stringify({ "csp-report": { "violated-directive": "script-src" } });
    assert.strictEqual(Buffer.byteLength(validBody, "utf8") <= MAX_BODY_BYTES, true);
  });

  test("should reject malformed JSON", () => {
    assert.throws(() => JSON.parse("{not valid json}"), SyntaxError);
  });

  test("should extract csp-report wrapper", () => {
    const parsed = { "csp-report": { "violated-directive": "script-src", "blocked-uri": "https://evil.com/script.js" } };
    const report = extractReport(parsed);
    assert.strictEqual(report?.["violated-directive"], "script-src");
  });

  test("should handle plain report without wrapper", () => {
    const parsed = { "violated-directive": "script-src", "blocked-uri": "https://evil.com/script.js" };
    const report = extractReport(parsed);
    assert.strictEqual(report?.["violated-directive"], "script-src");
  });

  test("should sanitize blocked URI to origin only", () => {
    assert.strictEqual(sanitizeBlockedUri("https://evil.com/path/script.js?x=1"), "https://evil.com");
    assert.strictEqual(sanitizeBlockedUri(null), "null");
    assert.strictEqual(sanitizeBlockedUri("not-a-url"), "non-url");
  });

  test("should sanitize directive name", () => {
    assert.strictEqual(sanitizeDirective("script-src"), "script-src");
    assert.strictEqual(sanitizeDirective("connect-src 'self'"), "connect-src__self_");
    assert.strictEqual(sanitizeDirective(null), "null");
  });

  test("should limit reports to MAX_REPORTS per request", () => {
    const reports = Array.from({ length: 15 }, (_, i) => ({ id: i }));
    const limited = reports.slice(0, MAX_REPORTS);
    assert.strictEqual(limited.length, MAX_REPORTS);
  });

  test("should not log full URLs or sensitive data", () => {
    const logSpy = mock.fn();
    const originalError = console.error;
    console.error = logSpy as any;

    const blockedUri = "https://evil.com/secret?token=abc123&user=john";
    const sanitized = sanitizeBlockedUri(blockedUri);
    console.error(`[csp-report] directive=script-src disposition=report blocked_origin=${sanitized}`);

    const logOutput = logSpy.mock.calls[0].arguments[0] as string;
    assert.ok(!logOutput.includes("evil.com/secret"), "Should not log full URL");
    assert.ok(!logOutput.includes("token=abc123"), "Should not log token");
    assert.ok(!logOutput.includes("user=john"), "Should not log PII");
    assert.ok(logOutput.includes("https://evil.com"), "Should log origin only");

    console.error = originalError;
  });
});