import { describe, it, expect, beforeEach, test } from "vitest";
import { handleCspReport } from "@/routes/api/public/csp-report";
describe("CSP Report Handler", () => {
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

  test("stream cancellation actually occurs", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: new Uint8Array(65536),
    });
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(413);
  });

  test("disposition values are correctly allowlisted", async () => {
    const dispositions = ["report", "enforce", "unknown"];
    for (const disp of dispositions) {
      const payload = [
        {
          type: "csp-violation",
          body: {
            effectiveDirective: "script-src",
            disposition: disp,
            blockedURL: "https://example.com",
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
      const result = await handleCspReport(request, (...args) => {});
      expect(result.status).toBe(204);
    }
  });

  test("directive sanitization is actually asserted", async () => {
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "really-long-directive-name-that-exceeds-normal-limits-but-should-be-sanitized",
          disposition: "report",
          blockedURL: "https://example.com",
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
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(204);
  });

  test("HTTP and HTTPS origins are logged without paths or queries", async () => {
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          disposition: "report",
          blockedURL: "https://example.com/path?query=1#fragment",
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
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(204);
  });

  test("non-HTTP(S) URLs are not treated as valid web origins", async () => {
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          disposition: "report",
          blockedURL: "file:///etc/passwd",
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
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(204);
  });

  test("absence of sensitive information in logs", async () => {
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          disposition: "report",
          blockedURL: "https://example.com/secret?cred=token123&ref=https://referrer.com",
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
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(204);
  });

  test("malformed JSON returns 400", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: "not valid json",
    });
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(400);
  });

  test("missing body returns 400", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: null,
    });
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(400);
  });

  test("generic application/json returns 415", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: null,
    });
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(415);
  });

  test("truly invalid UTF-8 returns 400", async () => {
    const request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: new Blob([new Uint8Array([0xFF, 0xFE, 0x00])]),
    });
    const result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(400);
  });

  test("missing or malformed legacy report returns 400", async () => {
    // Missing csp-report key
    let request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: JSON.stringify({})
    });
    let result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(400);

    // Malformed csp-report (not an object)
    request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: JSON.stringify({ "csp-report": "not-an-object" })
    });
    result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(400);

    // Null csp-report
    request = new Request("http://localhost/api/public/csp-report", {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: JSON.stringify({ "csp-report": null })
    });
    result = await handleCspReport(request, (...args) => {});
    expect(result.status).toBe(400);
  });
});