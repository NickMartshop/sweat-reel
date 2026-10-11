// Central AI extraction feature flag. Defaults to OFF everywhere.
// Client: VITE_AI_EXTRACTION_ENABLED; server: AI_EXTRACTION_ENABLED.
// Only the exact string "true" enables the feature. Missing/anything else => disabled.

export const AI_EXTRACTION_DISABLED_CODE = "AI_EXTRACTION_DISABLED";
export const AI_EXTRACTION_DISABLED_MESSAGE =
  "AI exercise extraction is temporarily unavailable. You can still add and edit exercises manually.";

export function parseAiFlag(value: unknown): boolean {
  return typeof value === "string" && value.trim().toLowerCase() === "true";
}

export function isAiExtractionEnabledClient(): boolean {
  return parseAiFlag(import.meta.env.VITE_AI_EXTRACTION_ENABLED);
}

/** Server-only: read inside handlers so env injection is respected. */
export function isAiExtractionEnabledServer(): boolean {
  return parseAiFlag(typeof process !== "undefined" ? process.env["AI_EXTRACTION_ENABLED"] : undefined);
}

export class AiExtractionDisabledError extends Error {
  code = AI_EXTRACTION_DISABLED_CODE;
  constructor() {
    super(AI_EXTRACTION_DISABLED_MESSAGE);
    this.name = "AiExtractionDisabledError";
  }
}
