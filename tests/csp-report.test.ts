import { describe, it, expect, beforeEach } from "vitest";
import { handleCspReport } from "@/routes/api/public/csp-report";

describe("CSP Report Handler", () => {
  beforeEach(() => {
    const { clearLoggerCalls } = require("@/routes/api/public/csp-report");
    clearLoggerCalls();
  });

  test("legacy valid payload", () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: JSON.stringify({ csp-report: { violatedDirective: "script-src", disposition: "report", blockedUri: "https://example.com" } }),
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });

  test("modern valid payload", () => {
    const payload = [{ type: "csp-violation", body: { effectiveDirective: "script-src", disposition: "report", blockedUrl: "https://example.com" } }];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);

    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });

  test("unsupported media type", () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: null,
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(415);
  });

  test("malformed JSON", () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: "not valid json",
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("invalid UTF-8", () => {
    const utf8Bytes = new TextEncoder().encode("\u0000\u0001\u0002");
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: new Blob([new Uint8Array(utf8Bytes)]),
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("missing body", () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: null,
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("invalid report entries", () => {
    const payload = [{ type: "wrong-type" }];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);

    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("empty array", () => {
    const payload = [];
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);

    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("exactly 10 reports", () => {
    const payload = Array.from({ length: 10 }, () => ({ type: "csp-violation", body: {} }));
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);

    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(204);
  });

  test("more than 10 reports", () => {
    const payload = Array.from({ length: 11 }, () => ({ type: "csp-violation", body: {} }));
    const contentType = "application/reports+json";
    const body = JSON.stringify(payload);
    const contentLength = Buffer.byteLength(body);

    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": contentType, "content-length": contentLength.toString() },
      body,
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(400);
  });

  test("Content-Length above the limit", () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report", "content-length": "20000" },
      body: "x",
    });

    const result = handleCspReport(request, () => {});
    expect(result.status).toBe(413);
  });
});
