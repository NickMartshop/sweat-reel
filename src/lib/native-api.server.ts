import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Max-Age": "86400",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export function jsonError(error: string, status: number, message?: string) {
  return jsonResponse(message ? { error, message } : { error }, status);
}

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** Verify the caller's Supabase JWT and return an RLS-scoped client. */
export async function authenticateRequest(request: Request) {
  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { error: jsonError("server_misconfigured", 500) } as const;
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return { error: jsonError("unauthorized", 401, "Missing bearer token") } as const;
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return { error: jsonError("unauthorized", 401, "Missing bearer token") } as const;
  }

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) {
    return { error: jsonError("unauthorized", 401, "Invalid token") } as const;
  }

  return { supabase, userId } as const;
}

// ---- AI extraction (mirrors the web server function exactly) ----

export const ExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(500),
  note: z.string().max(120).optional(),
});

export const ExtractRequestSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.string().max(2000).nullish(),
  platform: z.enum(["YouTube", "Instagram", "TikTok"]).nullish(),
});

export function buildExtractPrompt(title: string) {
  return `You are a fitness coach. Based only on this workout title: "${title}", create a realistic exercise list. Return ONLY a valid JSON array, no explanation, no markdown, no backticks. Use this exact format: [{"name": "Exercise Name", "sets": 3, "reps": 12}]. For cardio/yoga: use {"name": "Exercise", "sets": 1, "reps": 1, "note": "20 mins"}. Give 4-7 exercises maximum. Be realistic for the muscle group implied in the title.`;
}

export function parseExercises(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  const parsed = JSON.parse(match ? match[0] : cleaned);
  return z.array(ExerciseSchema).min(1).max(10).parse(parsed);
}

// ---- Workout preview URL parsing ----

export type PreviewPlatform = "YouTube" | "Instagram" | "TikTok";

export interface ParsedUrl {
  platform: PreviewPlatform;
  canonicalUrl: string;
  videoId?: string;
}

export function parseWorkoutUrl(raw: string): ParsedUrl | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtube.com" || host === "youtu.be" || host.endsWith(".youtube.com")) {
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.split("/")[1] ?? null;
    else if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
      if (m) id = m[2] ?? null;
    }
    if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
    return {
      platform: "YouTube",
      videoId: id,
      canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  }

  if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    const m = u.pathname.match(/^\/(p|reel|reels|tv)\/([^/?#]+)/);
    if (!m) return null;
    const kind = m[1] === "reels" ? "reel" : m[1];
    return {
      platform: "Instagram",
      canonicalUrl: `https://www.instagram.com/${kind}/${m[2]}/`,
    };
  }

  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    return {
      platform: "TikTok",
      canonicalUrl: `${u.origin}${u.pathname}`.replace(/\/$/, ""),
    };
  }

  return null;
}

async function fetchOEmbedTitle(endpoint: string): Promise<string | null> {
  try {
    const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const json = (await res.json()) as { title?: string; thumbnail_url?: string };
    return typeof json.title === "string" && json.title.trim() ? json.title.trim() : null;
  } catch {
    return null;
  }
}

export async function buildPreview(parsed: ParsedUrl) {
  if (parsed.platform === "YouTube") {
    const title = await fetchOEmbedTitle(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(parsed.canonicalUrl)}`,
    );
    return {
      platform: "YouTube" as const,
      title,
      thumbnailUrl: `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`,
      canonicalUrl: parsed.canonicalUrl,
    };
  }

  if (parsed.platform === "TikTok") {
    let title: string | null = null;
    let thumbnailUrl: string | null = null;
    try {
      const res = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(parsed.canonicalUrl)}`,
        { headers: { Accept: "application/json" } },
      );
      if (res.ok) {
        const json = (await res.json()) as { title?: string; thumbnail_url?: string };
        title = json.title?.trim() || null;
        thumbnailUrl = json.thumbnail_url ?? null;
      }
    } catch {
      /* metadata is best-effort */
    }
    return { platform: "TikTok" as const, title, thumbnailUrl, canonicalUrl: parsed.canonicalUrl };
  }

  return {
    platform: "Instagram" as const,
    title: null,
    thumbnailUrl: null,
    canonicalUrl: parsed.canonicalUrl,
  };
}
