# Native App Backend Bridge

Two new HTTP endpoints so the native SweatReel app can use the same server-side AI logic as the web app. No frontend, UI, or existing AI behavior changes.

## Endpoint hosting

This project's backend runs as app server routes, not Supabase Edge Functions — the AI key (`LOVABLE_API_KEY`) is a managed server secret of this app, not of the database project, so an Edge Function could not use it without copying the secret into a second place. The endpoints will therefore live on the app's own domain with the same behavior, auth, and JSON contract you specified:

```text
POST https://sweat-reel.lovable.app/api/public/ai-extract-exercises
POST https://sweat-reel.lovable.app/api/public/workout-preview
```

(`/api/public/*` only means "no Lovable site-auth wall" — both handlers do their own JWT checks. The preview domain `project--<id>-dev.lovable.app` serves the same paths for testing.)

If you specifically need the `/functions/v1/...` URL shape, say so and I'll revise — that path requires duplicating the AI secret into the database project.

## 1. ai-extract-exercises

Auth: requires `Authorization: Bearer <supabase user JWT>`. The user id is read from the verified token only; any `user_id` in the body is ignored.

Body: `{ "title": string, "url": string | null, "platform": "YouTube" | "Instagram" | "TikTok" | null }` — validated with Zod; `url`/`platform` are accepted and ignored for generation (same as web behavior today).

Flow, identical to the existing web server function:
1. Load the caller's profile row (as the caller, RLS enforced).
2. Premium active = `is_premium` AND (`premium_expires_at` null or in the future).
3. Free tier: 3 lifetime extractions, enforced server-side.
4. Atomic reservation: increment `ai_extractions_used` with a `lt(3)` guard before the AI call; zero rows updated means quota exceeded.
5. Call Lovable AI with `google/gemini-3-flash-preview` and the exact prompt used today.
6. On failure, refund the reservation and return an error.
7. Parse JSON, validate each exercise (`name`, `sets` 1-20, `reps` 1-500, optional `note`), cap at 10.
8. Bump the lifetime `ai_extractions_count` counter.

Responses:
- `200 { "exercises": [ { "name", "sets", "reps", "note?" } ] }`
- `401 { "error": "unauthorized" }`, `400 { "error": "invalid_request", ... }`, `402 { "error": "quota_exceeded" }`, `502 { "error": "ai_failed" }`
- No secret, key, or raw provider error is ever included in a response.

## 2. workout-preview

Body: `{ "url": string }`. No auth required beyond input validation (it only reads public metadata); rate-limited per IP.

- YouTube: extract the video id from `youtube.com/watch`, `youtu.be`, `/shorts/`, `/embed/`; title via public oEmbed; thumbnail `https://img.youtube.com/vi/<id>/hqdefault.jpg`; canonical `https://www.youtube.com/watch?v=<id>`.
- TikTok: title + thumbnail via TikTok's public oEmbed.
- Instagram: platform + canonical URL returned; `title` and `thumbnailUrl` may be `null` (Instagram blocks anonymous metadata).
- Anything else: `400 { "error": "unsupported_url" }`.

Response: `{ "platform", "title", "thumbnailUrl", "canonicalUrl" }`.

Both endpoints answer `OPTIONS` with CORS headers so the native app can call them from any origin.

## Files

Created:
- `src/routes/api/public/ai-extract-exercises.ts`
- `src/routes/api/public/workout-preview.ts`
- `src/lib/native-api.server.ts` — shared JWT verification, CORS, JSON error helpers, URL parsing

Modified: none. `src/lib/ai-extract.functions.ts` (web AI) stays untouched; the new route reuses the same prompt/model/schema logic via the shared helper.

## Verification

After building I'll call both endpoints live (unauthenticated 401 check, a real YouTube preview, and an authenticated extraction) and report the exact URLs and results. No secrets will appear in code, logs, or responses.
