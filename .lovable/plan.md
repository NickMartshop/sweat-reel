# SweatReel Production Update — Implementation Plan

Large scope. I'll implement in the order below so each section builds on the previous.

## 1. Database migration
Single migration adding to `profiles`: `is_premium`, `premium_plan`, `premium_expires_at`, `razorpay_payment_id`, `ai_extractions_used`. (Other columns from your SQL already exist: `fitness_goal`, `notifications_enabled`, `reminder_time`, `unlocked_achievements`, `referred_by`, and `body_stats` table.)

## 2. Env vars & security headers
- Add `VITE_RAZORPAY_KEY_ID`, `VITE_ADSENSE_CLIENT_ID`, `VITE_ADSENSE_AD_SLOT` to `.env` (placeholders — user fills in).
- Add CSP `<meta>` in `src/routes/__root.tsx` head (TanStack Start has no `index.html`).
- Add Razorpay checkout script tag via root `scripts`.
- `src/types/global.d.ts` with `Window.Razorpay` typings.

Note: I'll use `usePremium` as a plain React store (subscribe pattern like existing `authStore`) rather than adding Zustand — matches the codebase and avoids a new dep. Public API is identical (`usePremium()` hook + `checkPremium`/`refreshPremium`).

## 3. Premium store
`src/lib/premium-store.ts` — reads `is_premium`, plan, expiry, `ai_extractions_used` from `profiles`. Hydrated in `AppShell` when `auth.user` becomes available. Exposes `isPremium`, `plan`, `expiresAt`, `aiExtractionsUsed`, `checkPremium`, `refreshPremium`.

## 4. Free-tier limits
- **Library cap (15):** Check count in `AddWorkoutSheet` save; block + open UpgradeSheet with trigger `library_limit`. Home banner "📚 n/15 saved · Go unlimited →" with 24h dismiss via `localStorage`.
- **AI cap (3):** In `extractExercises` call site (AddWorkoutSheet), gate before invoking serverFn; increment `ai_extractions_used` after success (server already increments `ai_extractions_count` — I'll add a parallel `ai_extractions_used` update from the client and refresh). Show "✨ {n} AI uses left" hint.
- **Plans cap (3 days):** Thu–Sun rendered with 🔒 overlay in `plans.tsx` day picker. Tapping shows inline upgrade card; open UpgradeSheet with `plans_locked`.

## 5. UpgradeSheet component
New `src/components/fitvault/UpgradeSheet.tsx`. Bottom sheet with trigger-based headline, feature comparison table, Monthly/Annual toggle (annual default, "SAVE 44%" badge), gradient CTA with pulse, Restore Purchase, secure footer, close button (hidden when `trigger==='library_limit'`).

## 6. Razorpay integration
`handleUpgrade` inside UpgradeSheet — opens Razorpay checkout with `VITE_RAZORPAY_KEY_ID`, `handler` updates `profiles` (dedupe on `razorpay_payment_id`), refreshes premium, closes sheet, shows success screen. `payment.failed` + `ondismiss` handled. Restore Purchase prompts for payment ID and validates against `profiles`.

Comment near key usage: `// KEY_ID only — secret key must NEVER be in frontend`.

## 7. Premium success screen
`src/components/fitvault/PremiumSuccess.tsx` — fixed full-screen overlay, CSS confetti (30 particles), ⚡ glow, stats row, plan pill, "Start Training 🔥" CTA, 6s auto-dismiss. Mounted from `AppShell`, triggered via a small event bus in `premium-store`.

## 8. AdSense banner
`src/components/fitvault/AdBanner.tsx` — hides for premium, renders `<ins class="adsbygoogle">` when `VITE_ADSENSE_CLIENT_ID` configured, otherwise dashed placeholder. AdSense loader script added conditionally in `__root.tsx` head. Placed on Home (between stats and Today's Plan) and Progress (between weekly chart and monthly heatmap).

## 9. Gear screen refresh
Rewrite `src/lib/gear-catalog.ts` with 6 products (emoji + gradient, real Amazon links, tags, ratings, reviews). Rewrite `src/routes/gear.tsx`: yellow affiliate disclosure banner, emoji-card products (no external images), category filter with emojis, 150ms delayed `window.open` with toast, empty state per category.

## 10. Profile screen premium UI
In `src/routes/profile.tsx`: `PRO ⚡` pill next to name for premium; replace upgrade row with active status card (plan + renews date). Free users see gradient "Go Pro — ₹999/year" card opening UpgradeSheet(`manual`). Keep existing About/Danger Zone; add "Rate SweatReel" placeholder + "Refer a Friend" (copy `?ref=<uid>` link).

## 11. Terms page
Update `src/routes/terms.tsx` to the full 7-section content specified.

## 12. Play Store readiness
- Overwrite `public/manifest.json` per spec (shortcuts, screenshots entry, `en-IN`, categories).
- Update `src/routes/__root.tsx` head: title, description, keywords, OG tags, canonical, apple-web-app metas, theme-color. (TanStack Start owns HTML head — no `index.html` edits.)

## 13. Security hardening
- **Rate limit AI:** 3s cooldown on AI extract button in AddWorkoutSheet.
- **Sanitize inputs:** shared `sanitize()` util applied to workout title, exercise name, notes on save.
- **URL validation:** `isValidWorkoutUrl` in AddWorkoutSheet; error toast for invalid.
- **Auth events:** extend existing `onAuthStateChange` in root/`auth-store` — refresh premium on `TOKEN_REFRESHED`; on `SIGNED_OUT` clear premium state.
- **Loading states:** ensure UpgradeSheet CTA disables during `isProcessing`; existing skeletons kept.
- XSS: all existing renders already use `{text}` — verified.

## Technical notes
- No Zustand added; premium store follows existing subscribe pattern.
- No `index.html` edits — TanStack Start renders HTML via `__root.tsx` `head()` and `scripts`; CSP meta + Razorpay/AdSense scripts go there.
- `admin.deleteUser` remains out of scope (client-side); existing `DeleteAccountDialog` message already matches spec.
- Screenshot file `/screenshots/home.png` referenced in manifest is optional — I'll leave the entry and note it; the manifest still validates without the file present in most stores, but ideally you upload one later.
- Amazon Associate tag `nickinfotech-21` noted in code comment as requested; the `amzn.to`/`a.co` short links you provided already carry your tag server-side.

## Files
**New:** `src/lib/premium-store.ts`, `src/components/fitvault/UpgradeSheet.tsx`, `src/components/fitvault/PremiumSuccess.tsx`, `src/components/fitvault/AdBanner.tsx`, `src/types/global.d.ts`, `src/lib/sanitize.ts`
**Edited:** `.env`, `public/manifest.json`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/plans.tsx`, `src/routes/progress.tsx`, `src/routes/profile.tsx`, `src/routes/gear.tsx`, `src/routes/terms.tsx`, `src/lib/gear-catalog.ts`, `src/lib/auth-store.ts`, `src/lib/profile-store.ts`, `src/components/fitvault/AppShell.tsx`, `src/components/fitvault/AddWorkoutSheet.tsx`
**Migration:** one call adding 5 premium columns to `profiles`.
