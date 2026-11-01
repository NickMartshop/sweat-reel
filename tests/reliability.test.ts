import { test } from "node:test";
import assert from "node:assert/strict";

// Import the pure logic modules directly (Node 26 strips TS types at runtime).
// These functions have no browser/React dependencies at module scope.
const data = await import("../src/lib/fitvault-data.ts");
const ai = await import("../src/lib/ai-feature.ts");

const {
  isValidDuration,
  formatDuration,
  thumbnailCandidates,
  rowToWorkout,
  MIN_DURATION_MINS,
  MAX_DURATION_MINS,
} = data;

const { parseAiFlag, isAiExtractionEnabledServer, AI_EXTRACTION_DISABLED_CODE } = ai;

// ---------------------------------------------------------------------------
// B. AI extraction feature flag — default OFF, only exact "true" enables.
// ---------------------------------------------------------------------------

test("AI flag: parseAiFlag defaults to OFF for missing/invalid values", () => {
  assert.equal(parseAiFlag(undefined), false);
  assert.equal(parseAiFlag(null), false);
  assert.equal(parseAiFlag(""), false);
  assert.equal(parseAiFlag("false"), false);
  assert.equal(parseAiFlag("0"), false);
  assert.equal(parseAiFlag("no"), false);
  assert.equal(parseAiFlag(1), false); // non-string
  assert.equal(parseAiFlag(true), false); // boolean is not the string "true"
});

test("AI flag: only the exact string 'true' (case-insensitive) enables", () => {
  assert.equal(parseAiFlag("true"), true);
  assert.equal(parseAiFlag("TRUE"), true);
  assert.equal(parseAiFlag(" True "), true);
  assert.equal(parseAiFlag("truthy"), false);
  assert.equal(parseAiFlag("true-ish"), false);
});

test("AI flag: server gate reads AI_EXTRACTION_ENABLED and defaults OFF", () => {
  delete process.env["AI_EXTRACTION_ENABLED"];
  assert.equal(isAiExtractionEnabledServer(), false);

  process.env["AI_EXTRACTION_ENABLED"] = "false";
  assert.equal(isAiExtractionEnabledServer(), false);

  process.env["AI_EXTRACTION_ENABLED"] = "true";
  assert.equal(isAiExtractionEnabledServer(), true);

  delete process.env["AI_EXTRACTION_ENABLED"];
});

test("AI flag: disabled error carries the AI_EXTRACTION_DISABLED code", () => {
  assert.equal(AI_EXTRACTION_DISABLED_CODE, "AI_EXTRACTION_DISABLED");
});

// ---------------------------------------------------------------------------
// D. Duration validation — invalid values like 96313 must never render.
// ---------------------------------------------------------------------------

test("duration: isValidDuration accepts whole minutes within 1-600", () => {
  assert.equal(isValidDuration(1), true);
  assert.equal(isValidDuration(30), true);
  assert.equal(isValidDuration(MAX_DURATION_MINS), true);
});

test("duration: absurd values such as 96313 are rejected", () => {
  assert.equal(isValidDuration(96313), false);
  assert.equal(isValidDuration(0), false);
  assert.equal(isValidDuration(-5), false);
  assert.equal(isValidDuration(MIN_DURATION_MINS - 1), false);
  assert.equal(isValidDuration(MAX_DURATION_MINS + 1), false);
});

test("duration: non-integers and non-numbers are rejected", () => {
  assert.equal(isValidDuration(30.5), false);
  assert.equal(isValidDuration("30"), false);
  assert.equal(isValidDuration(NaN), false);
  assert.equal(isValidDuration(null), false);
  assert.equal(isValidDuration(undefined), false);
});

test("duration: formatDuration returns null for invalid values (96313 never shows)", () => {
  assert.equal(formatDuration(30), "30 min");
  assert.equal(formatDuration(96313), null);
  assert.equal(formatDuration(0), null);
  assert.equal(formatDuration(undefined), null);
});

// ---------------------------------------------------------------------------
// D. Thumbnails — no random Picsum photos; neutral placeholder fallback.
// ---------------------------------------------------------------------------

test("thumbnails: a Picsum URL is never used as a candidate", () => {
  const out = thumbnailCandidates("https://picsum.photos/seed/abc/640/360");
  assert.equal(out.length, 0); // falls through to the neutral placeholder
});

test("thumbnails: a valid stored thumbnail is used first", () => {
  const out = thumbnailCandidates("https://cdn.example.com/w.jpg");
  assert.deepEqual(out, ["https://cdn.example.com/w.jpg"]);
});

test("thumbnails: missing thumbnail falls back to a YouTube thumbnail when possible", () => {
  const out = thumbnailCandidates(null, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.deepEqual(out, ["https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"]);
});

test("thumbnails: no thumbnail and no YouTube source yields an empty list (placeholder)", () => {
  assert.deepEqual(thumbnailCandidates(null, null), []);
  assert.deepEqual(thumbnailCandidates("", "https://instagram.com/p/x"), []);
});

test("rowToWorkout: nulls a missing/blank thumbnail and preserves the source URL", () => {
  const w = rowToWorkout({ id: "1", title: "T", url: "https://youtu.be/abc12345678" });
  assert.equal(w.thumbnail_url, null); // never a stock photo
  assert.equal(w.source_url, "https://youtu.be/abc12345678"); // original kept
});

test("rowToWorkout: keeps a real thumbnail and coerces a blank one to null", () => {
  assert.equal(
    rowToWorkout({ id: "1", title: "T", thumbnail_url: "https://cdn/x.jpg" }).thumbnail_url,
    "https://cdn/x.jpg",
  );
  assert.equal(rowToWorkout({ id: "1", title: "T", thumbnail_url: "  " }).thumbnail_url, null);
});

// ---------------------------------------------------------------------------
// B. Both server paths gate AI BEFORE quota reservation / provider / counter.
//    Asserted by source inspection (no provider is ever constructed here).
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";

function readSrc(p: string): string {
  return readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
}

test("ai-extract.functions.ts: disabled gate runs before quota/provider/counter", () => {
  const src = readSrc("lib/ai-extract.functions.ts");
  const gateIdx = src.indexOf("if (!isAiExtractionEnabledServer())");
  // Quota may be enforced via an RPC reservation or a conditional column update;
  // either way it must come after the gate and before the provider call.
  const quotaIdx = Math.min(
    ...["reserve_ai_extraction", "ai_extractions_used"]
      .map((t) => src.indexOf(t))
      .filter((i) => i >= 0),
  );
  // Match the provider *construction/call* (const gateway = createLovableAiGatewayProvider()),
  // not the top-of-file static import which is hoisted and constructs nothing.
  const providerIdx = src.indexOf("createLovableAiGatewayProvider(key)");
  // Lifetime counter may be the record_ai_extraction_success RPC or a direct
  // ai_extractions_count column update; either must come after the gate.
  const successIdx = Math.min(
    ...["record_ai_extraction_success", "ai_extractions_count"]
      .map((t) => src.indexOf(t))
      .filter((i) => i >= 0),
  );
  assert.ok(gateIdx >= 0, "server feature gate present");
  assert.ok(quotaIdx >= 0, "some quota check is present");
  assert.ok(gateIdx < quotaIdx, "gate before quota reservation");
  assert.ok(gateIdx < providerIdx, "gate before AI provider construction");
  assert.ok(gateIdx < successIdx, "gate before usage-counter increment");
  assert.match(src, /setResponseStatus\(503\)/, "returns 503 while disabled");
});

test("api route ai-extract-exercises.ts: 503 gate before quota/provider/counter", () => {
  const src = readSrc("routes/api/public/ai-extract-exercises.ts");
  const gateIdx = src.indexOf("if (!isAiExtractionEnabledServer())");
  const reserveIdx = src.indexOf("reserve_ai_extraction_v2");
  const providerIdx = src.indexOf("= createLovableAiGatewayProvider(");
  const successIdx = src.indexOf("record_ai_extraction_success");
  assert.ok(gateIdx >= 0, "server feature gate present");
  assert.ok(gateIdx < reserveIdx, "gate before quota reservation");
  assert.ok(gateIdx < providerIdx, "gate before AI provider construction");
  assert.ok(gateIdx < successIdx, "gate before usage-counter increment");
  assert.match(src, /jsonError\(AI_EXTRACTION_DISABLED_CODE, 503/, "returns 503 while disabled");
});

test("no Picsum fallback anywhere in the fitvault source", () => {
  const src = readSrc("lib/fitvault-data.ts");
  // picsum may only appear in an exclusion guard, never as a substituted photo.
  const picsumLines = src.split("\n").filter((l) => /picsum/i.test(l));
  for (const line of picsumLines) {
    assert.match(line, /test|includes|!/i, "picsum only referenced to exclude it");
  }
});

// ---------------------------------------------------------------------------
// C. Owner-scoped mutations — update/delete scope by user_id; delete rolls back
//    on failure; Add-to-Plan awaits persistence. Asserted by source inspection.
// ---------------------------------------------------------------------------

test("workoutsStore.update is owner-scoped and throws when no row is affected", () => {
  const src = readSrc("lib/workouts-store.ts");
  const updateBlock = src.slice(src.indexOf("update: async"), src.indexOf("remove: async"));
  assert.match(updateBlock, /\.eq\("user_id", user\.id\)/, "update filters by owner");
  assert.match(updateBlock, /if \(error\) throw error/, "update surfaces DB errors");
  assert.match(updateBlock, /if \(!data\) throw/, "update throws when nothing updated");
});

test("workoutsStore.remove is owner-scoped and restores prior state on failure", () => {
  const src = readSrc("lib/workouts-store.ts");
  const removeBlock = src.slice(src.indexOf("remove: async"));
  assert.match(removeBlock, /\.eq\("id", id\)/, "delete targets the id");
  assert.match(removeBlock, /\.eq\("user_id", user\.id\)/, "delete filters by owner");
  assert.match(removeBlock, /state = \{ \.\.\.state, workouts: prev \}/, "rollback on failure");
  assert.match(removeBlock, /throw error/, "delete rethrows on failure");
});

test("plansStore.add awaits persistence and scopes the insert to the owner", () => {
  const src = readSrc("lib/plans-store.ts");
  const addBlock = src.slice(src.indexOf("add: async"));
  assert.match(addBlock, /user_id: user\.id/, "insert is owner-scoped");
  assert.match(addBlock, /if \(error\) throw/, "add surfaces DB errors");
});

// ---------------------------------------------------------------------------
// C. WorkoutDetailSheet has no fake success paths and uses real handlers.
// ---------------------------------------------------------------------------

test("WorkoutDetailSheet: no fake 'Edit coming soon' / toast-only add paths", () => {
  const src = readSrc("components/fitvault/WorkoutDetailSheet.tsx");
  assert.doesNotMatch(src, /Edit coming soon/, "no fake edit message");
  assert.match(src, /await workoutsStore\.update\(/, "edit awaits a real update");
  assert.match(src, /await workoutsStore\.remove\(/, "delete awaits a real remove");
  assert.match(src, /await plansStore\.add\(/, "add-to-plan awaits persistence");
  assert.match(src, /WorkoutThumbnail/, "uses the shared thumbnail component");
  assert.match(src, /formatDuration/, "uses the shared duration formatter");
});
