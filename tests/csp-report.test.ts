import { describe, it, expect, vi } from "vitest";
import { handleCspReport } from "@/routes/api/public/csp-report";

function makeRequest(
  body: string,
  contentType = "application/csp-report",
  extraHeaders: Record<string, string> = {},
) {
  return new Request("http://localhost/api/public/csp-report", {
    method: "POST",
    headers: {
      "content-type": contentType,
      ...extraHeaders,
    },
    body,
  });
}

describe("CSP Report Handler", () => {
  it("legacy report with actual hyphenated field names logs correct values", async () => {
    const logSpy = vi.fn();
    const legacyReport = {
      "csp-report": {
        "violated-directive": "script-src-elem",
        "effective-directive": "script-src",
        "blocked-uri": "https://evil.example.com/x",
        "disposition": "report",
      },
    };
    const request = makeRequest(JSON.stringify(legacyReport), "application/csp-report");
    const result = await handleCspReport(request, logSpy);

    expect(result.status).toBe(204);
    expect(logSpy).toHaveBeenCalledTimes(1);
    const [directive, disposition, blockedOrigin] = logSpy.mock.calls[0];
    expect(directive).toBe("script-src-elem");
    expect(disposition).toBe("report");
    expect(blockedOrigin).toBe("https://evil.example.com");
  });

  it("modern report with nested body logs correct values", async () => {
    const logSpy = vi.fn();
    const modernReport = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "frame-ancestors",
          blockedURL: "https://evil.example.com/iframe",
          disposition: "enforce",
        },
      },
    ];
    const request = makeRequest(JSON.stringify(modernReport), "application/reports+json");
    const result = await handleCspReport(request, logSpy);

    expect(result.status).toBe(204);
    expect(logSpy).toHaveBeenCalledTimes(1);
    const [directive, disposition, blockedOrigin] = logSpy.mock.calls[0];
    expect(directive).toBe("frame-ancestors");
    expect(disposition).toBe("enforce");
    expect(blockedOrigin).toBe("https://evil.example.com");
  });

  it("modern report fields are not read from the outer object", async () => {
    const logSpy = vi.fn();
    const modernReport = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "https://example.com",
          disposition: "report",
        },
        outerOnly: "should-not-leak",
      },
    ];
    const request = makeRequest(JSON.stringify(modernReport), "application/reports+json");
    await handleCspReport(request, logSpy);

    expect(logSpy).toHaveBeenCalledTimes(1);
    const [directive] = logSpy.mock.calls[0];
    expect(directive).toBe("script-src");
  });

  it("missing or malformed modern body returns 400", async () => {
    const logSpy = vi.fn();
    const payloadNoBody = [{ type: "csp-violation" }];
    let request = makeRequest(JSON.stringify(payloadNoBody), "application/reports+json");
    let result = await handleCspReport(request, logSpy);
    expect(result.status).toBe(400);

    const payloadNullBody = [{ type: "csp-violation", body: null }];
    request = makeRequest(JSON.stringify(payloadNullBody), "application/reports+json");
    result = await handleCspReport(request, logSpy);
    expect(result.status).toBe(400);
  });

  it("incorrect report types return 400", async () => {
    const logSpy = vi.fn();
    const payload = [
      {
        type: "csp-violation-wrong",
        body: { effectiveDirective: "x", blockedURL: "", disposition: "report" },
      },
    ];
    const request = makeRequest(JSON.stringify(payload), "application/reports+json");
    const result = await handleCspReport(request, logSpy);

    expect(result.status).toBe(400);
  });
  it("disposition allowlisting is actually asserted", async () => {
    const logSpy = vi.fn();
    const dispositions = ["report", "enforce", "unknown", "invalid"];
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
      const request = makeRequest(JSON.stringify(payload), "application/reports+json");
      await handleCspReport(request, logSpy);
    }

    expect(logSpy.mock.calls).toHaveLength(4);
    for (const call of logSpy.mock.calls) {
      const [_, disposition] = call;
      if (disposition === "report" || disposition === "enforce") {
        expect(["report", "enforce"]).toContain(disposition);
      } else {
        expect(disposition).toBe("unknown");
      }
    }
  });

  it("HTTP and HTTPS URLs log only their origins", async () => {
    const logSpy = vi.fn();
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "https://example.com/path?query=1#fragment",
          disposition: "report",
        },
      },
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "http://test.org:8080/path",
          disposition: "report",
        },
      },
    ];
    const request = makeRequest(JSON.stringify(payload), "application/reports+json");
    await handleCspReport(request, logSpy);

    expect(logSpy.mock.calls).toEqual([
      ["script-src", "report", "https://example.com"],
      ["script-src", "report", "http://test.org:8080"],
    ]);
  });

  it("FTP and file URLs are not logged as valid HTTP origins", async () => {
    const logSpy = vi.fn();
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "ftp://evil.example.com/file",
          disposition: "report",
        },
      },
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "file:///etc/passwd",
          disposition: "report",
        },
      },
    ];
    const request = makeRequest(JSON.stringify(payload), "application/reports+json");
    await handleCspReport(request, logSpy);

    expect(logSpy.mock.calls).toEqual([
      ["script-src", "report", "non-url"],
      ["script-src", "report", "non-url"],
    ]);
  });

  it("no path, query, fragment or credentials leak into logs", async () => {
    const logSpy = vi.fn();
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "https://user:pass@example.com/secret?cred=token123&ref=https://referrer.com",
          disposition: "report",
        },
      },
    ];
    const request = makeRequest(JSON.stringify(payload), "application/reports+json");
    await handleCspReport(request, logSpy);

    const [directive, disposition, blockedOrigin] = logSpy.mock.calls[0];
    expect(blockedOrigin).toBe("https://example.com");
    expect(directive).not.toContain("user:");
    expect(directive).not.toContain("pass@");
    expect(directive).not.toContain("token123");
  });

  it("directive sanitization and 128-character limit are actually asserted", async () => {
    const logSpy = vi.fn();
    const longDirective = "a".repeat(200);
    const payload = [
      {
        type: "csp-violation",
        body: {
          effectiveDirective: longDirective,
          blockedURL: "https://example.com",
          disposition: "report",
        },
      },
    ];
    const request = makeRequest(JSON.stringify(payload), "application/reports+json");
    await handleCspReport(request, logSpy);

    const [directive] = logSpy.mock.calls[0];
    expect(directive).toBe("a".repeat(128));
  });
});
});
