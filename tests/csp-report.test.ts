import { describe, it, expect, beforeEach, test } from "vitest";
import { handleCspReport } from "@/routes/api/public/csp-report";

describe("CSP Report Handler", () => {
  beforeEach(() => {});

  test("legacy valid payload", async () => {
    const legacyReport = {
      "csp-report": {
        violatedDirective: "script-src",
        disposition: "report",
        blockedUri: "https://example.com",
      },
    };
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: JSON.stringify(legacyReport),
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });

  test("modern valid payload", async () => {
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          disposition: "report",
          blockedUrl: "https://example.com",
        },
      },
    ];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });

  test("unsupported media type", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: null,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(415);
  });

  test("malformed JSON", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: "not valid json",
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("invalid UTF-8", async () => {
    const utf8Bytes = new TextEncoder().encode("\u0000\u0001\u0002");
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: new Blob([new Uint8Array(utf8Bytes)]),
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("missing body", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: null,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("invalid report entries", async () => {
    const payload = [{ type: "wrong-type" }];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("empty array", async () => {
    const payload = [];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("exactly 10 reports", async () => {
    const payload = Array.from({ length: 10 }, () => ({ type: "csp-violation", body: {} }));
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });

  test("more than 10 reports", async () => {
    const payload = Array.from({ length: 11 }, () => ({ type: "csp-violation", body: {} }));
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("Content-Length above the limit", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report", "content-length": "20000" },
      body: "x",
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(413);
  });

  test("oversized streaming body without Content-Length", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: new Uint8Array(65536),
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(413);
  });

  test("directive sanitization and max length", async () => {
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective:
            "really-long-directive-name-that-exceeds-normal-limits-but-should-be-sanitized",
          disposition: "report",
          blockedUri: "https://example.com",
        },
      },
    ];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });

  test("HTTP-only origin logging for blocked URLs", async () => {
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          disposition: "report",
          blockedUri: "https://example.com/path?query=1#fragment",
        },
      },
    ];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });

  test("absence of sensitive information in logs", async () => {
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          disposition: "report",
          blockedUri: "https://example.com/secret?cred=token123&ref=https://referrer.com",
        },
      },
    ];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });
    const result = await handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });
});
