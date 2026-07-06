// Input sanitization + URL validation helpers.
// Client-side only; RLS + server-side validation are the real security boundary.

export function sanitize(input: string): string {
  return input
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
    .slice(0, 500);
}

const VALID_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "instagram.com",
  "tiktok.com",
];

export function isValidWorkoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return VALID_DOMAINS.some(
      (d) => host === d || host === "www." + d || host === "m." + d || host.endsWith("." + d),
    );
  } catch {
    return false;
  }
}
