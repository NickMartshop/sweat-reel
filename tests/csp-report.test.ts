import { test, describe, beforeEach } from "vitest";
import { strict as assert } from "node:assert";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_REPORTS = 10;

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sanitizeBlockedUri(uri) {
  if (!uri) return "null";
  try {
    const u = new URL(uri);
    return u.origin;
  } catch {
    return "non-url";
  }
}

function sanitizeDirective(directive) {
  if (!directive) return "null";
  return directive.replace(/[^\w-]/g, "_");
}

let loggerCalls = [];

let logger = (directive, disposition, blockedOrigin) => {
  loggerCalls.push({ directive, disposition, blockedOrigin });
  console.error(
    `[csp-report] directive=${directive} disposition=${disposition} blocked_origin=${blockedOrigin}`,
  );
};

function resetLogger() {
  loggerCalls = [];
}

function createMockRequest(body, contentType) {
  const enc = new TextEncoder();
  const chunks = typeof body === "string" ? enc.encode(body) : typeof body === "object" && body !== null && !Array.isArray(body) ? body : enc.encode(JSON.stringify(body));
  
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(chunks);
      controller.close();
    },
    async pull() {},
    async cancel() {},
  });
  
  return new Request("http://test.com/api", {
    method: "POST",
    body: stream,
    headers: new Headers({ "content-type": contentType }),
    duplex: "half",
  });
}

describe("CSP report production handler", () => {
  beforeEach(() => {
    resetLogger();
  });

  test("should accept application/csp-report content type and valid report", async () => {
    const request = createMockRequest(
      JSON.stringify({ "csp-report": { "violated-directive": "script-src", "blocked-uri": "https://evil.com/script.js" } }),
      "application/csp-report"
    );
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    const response = await handler({ request });
    assert.strictEqual(response.status, 204);
  });

  test("should accept application/reports+json content type and valid array of reports", async () => {
    const request = createMockRequest(
      JSON.stringify([
        { type: "csp-violation", violatedirective: "script-src", blockeduri: "https://evil.com/script.js" },
        { type: "csp-violation", violatedirective: "img-src", blockeduri: "https://evil.com/image.jpg" }
      ]),
      "application/reports+json"
    );
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    const response = await handler({ request });
    assert.strictEqual(response.status, 204);
  });

  test("should reject unsupported content type with 415", async () => {
    const request = createMockRequest(JSON.stringify({ foo: "bar" }), "text/plain");
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    const response = await handler({ request });
    assert.strictEqual(response.status, 415);
    const body = await response.json();
    assert.strictEqual(body.error, "unsupported_media_type");
  });

  test("should reject oversized body with 413", async () => {
    const oversizedBody = "x".repeat(MAX_BODY_BYTES + 1);
    const request = createMockRequest(oversizedBody, "application/csp-report");
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    const response = await handler({ request });
    assert.strictEqual(response.status, 413);
  });

  test("should reject malformed JSON with 400", async () => {
    const request = createMockRequest("{not valid json}", "application/csp-report");
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    const response = await handler({ request });
    assert.strictEqual(response.status, 400);
  });

  test("should reject missing csp-report object in legacy format with 400", async () => {
    const request = createMockRequest(JSON.stringify({ "other-key": "value" }), "application/csp-report");
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    const response = await handler({ request });
    assert.strictEqual(response.status, 400);
  });

  test("should reject more than 10 reports with 400", async () => {
    const reports = Array.from({ length: 15 }, (_, i) => ({ type: "csp-violation", violatedirective: "directive-" + i, blockeduri: "https://evil.com/" + i + ".js" }));
    const request = createMockRequest(JSON.stringify(reports), "application/reports+json");
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    const response = await handler({ request });
    assert.strictEqual(response.status, 400);
  });

  test("should accept exactly 10 reports with 204", async () => {
    const reports = Array.from({ length: 10 }, (_, i) => ({ type: "csp-violation", violatedirective: "directive-" + i, blockeduri: "https://evil.com/" + i + ".js" }));
    const request = createMockRequest(JSON.stringify(reports), "application/reports+json");
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    const response = await handler({ request });
    assert.strictEqual(response.status, 204);
  });

  test("should sanitize blocked URI to origin only", async () => {
    const reports = [
      { type: "csp-violation", violatedirective: "script-src", blockeduri: "https://evil.com/path/script.js?token=abc&user=john" }
    ];
    const request = createMockRequest(JSON.stringify(reports), "application/reports+json");
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    await handler({ request });
    assert.ok(!loggerCalls[0].blocked_origin.includes("/path"));
    assert.ok(!loggerCalls[0].blocked_origin.includes("token="));
    assert.ok(!loggerCalls[0].blocked_origin.includes("user="));
    assert.ok(loggerCalls[0].blocked_origin.includes("https://evil.com"));
  });

  test("should sanitize directive name", async () => {
    const reports = [
      { type: "csp-violation", violatedirective: "connect-src 'self'", blockeduri: "https://evil.com/script.js" }
    ];
    const request = createMockRequest(JSON.stringify(reports), "application/reports+json");
    const handler = (await import("@/routes/api/public/csp-report")).Route.server.handlers.POST;
    await handler({ request });
    assert.ok(!loggerCalls[0].directive.includes("'"));
  });
});
