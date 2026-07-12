## Part 1 — Onboarding rewrite (`src/components/fitvault/Onboarding.tsx`)

Replace the 3-slide + goal flow with a single screen:

- Full-screen `#0A0A0F`, blue radial glow (`400px`, `top: 30%`, `rgba(67,97,238,0.2)`, blurred).
- **Logo**: 80px circle, `#141420` bg, 2px `#4361EE` border, "SR" 28/700 `#4361EE`.
- **Headline**: `"Stop losing your workout reels."` / `"Start training smarter."` — 28/700 white, 16px top margin.
- **Value pills** row (flex-wrap, centered): `📹 Save any video`, `🤖 AI exercise list`, `📅 Plan your week`, `🔥 Build streaks`. Each `#141420`/`#252535` border, 12px `#8888AA`, radius 50px, padding `6px 12px`.
- **Phone mockup**: 200×360 rounded rect, `#141420` bg, 2px `#252535` border, containing a 2-col grid of colored rectangles (`#4361EE / #FF6B35 / #06D6A0 / #EF476F`) as fake workout cards. Pure CSS.
- **Bottom fixed section** (`padding: 24px`, safe-area):
  - Primary CTA `Get Started — It's Free`, 56px, radius 14, gradient `#4361EE→#7B2FBE`, 17/600 white → calls `onDone(null)` then routes into signup (default Auth mode is already `signup`).
  - Below: `Already have an account? Sign in` (12px muted, "Sign in" in `#4361EE`) → calls `onDone(null)` and stashes `sessionStorage.setItem('sweatreel_auth_mode','signin')` so AuthScreen opens in sign-in mode.

Drop the `slides`, `GOAL_OPTIONS`, and `FitnessGoal` props/plumbing inside this component. `onDone` signature stays `(goal: null) => void` (compat with `AppShell`), always passes `null`.

**Fitness goal moved in-app**: add a lightweight first-time goal modal on Home. Create `src/components/fitvault/FirstTimeGoalPrompt.tsx` — reads/writes `localStorage` flag `sweatreel_goal_asked`, shows a bottom sheet with the 4 goals (build/lose/flex/general), saves via `profileStore.setFitnessGoal`. Mount it once in `src/routes/index.tsx`. Skipping is allowed (dismiss ×).

## Part 2 — Auth screen improvements (`src/components/fitvault/AuthScreen.tsx`)

- Read `sessionStorage.sweatreel_auth_mode` on mount to pick initial `mode`.
- Above the mode tabs, add the green **Free tier badge**: `✅ Free to use — no credit card needed`, `rgba(6,214,160,0.1)` bg, `rgba(6,214,160,0.3)` border, 12px `#06D6A0`, centered, padding `8px 16px`, radius 8, `margin-bottom: 16px`.
- Replace the current "By signing up you agree to our Privacy Policy" line (signup mode only) with:
  `By signing up you agree to our Privacy Policy and Terms of Service.` — 11px `#8888AA` centered, both `<Link>` (`to="/privacy"`, `to="/terms"`) in `#4361EE`, tappable padding.
- Add the sign-up rate limiter (Part 4).
- Redact error logging (Part 4).

## Part 3 — Mobile keyboard fix

- Wrap the scrollable body of `AddWorkoutSheet` (currently the `<div className="flex-1 overflow-y-auto ...">` at line 308) with inline style `WebkitOverflowScrolling: 'touch'` and `paddingBottom: 'env(keyboard-inset-height, 300px)'` (keep existing Tailwind `overflow-y-auto`).
- Wrap AuthScreen's outer container similarly so the form scrolls above the keyboard: apply the same three inline styles to the existing form container.
- Viewport meta: **there is no `index.html`** in TanStack Start. Add the viewport meta via the root route `head()` in `src/routes/__root.tsx` (append `{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, interactive-widget=resizes-content' }`; remove any existing viewport entry first to avoid duplication).

## Part 4 — Security hardening

**AI extract cooldown**: `AddWorkoutSheet.aiExtract` already has a 3s server-side cooldown. Add the 5s client-side gate as specified: `lastExtractTime` state, early-return with `toast.info('Please wait 5 seconds between extractions')` when `Date.now() - lastExtractTime < 5000`, set on successful start.

**Signup rate limit**: in `AuthScreen`, add `signUpAttempts`, `signUpAttemptWindowStart`, `signUpLocked` state. On each signup submit, if within the 60s window increment; at ≥5 set `signUpLocked=true`, toast `Too many attempts. Wait 60 seconds.`, `setTimeout(60000)` to clear lock + reset attempts. Disable the submit button when `signUpLocked`. Only applies in `signup` mode.

**Error redaction**: replace all `console.error(...)` sites we introduce/touch with `console.error('Supabase error code:', error?.code)`. Do a scoped sweep of the two files being edited (`AuthScreen`, `AddWorkoutSheet`) — no global rewrite of unrelated files.

Skip any "Supabase client init" change — the client file is auto-generated and off-limits.

## Part 5 — Performance

- Add `loading="lazy"` and `decoding="async"` to `<img>` in `src/components/fitvault/WorkoutCard.tsx` and the thumbnail `<img>` in `AddWorkoutSheet.tsx` (line 344). (Gear's ProductImage is already user-triggered visible content; add the attributes there too for consistency.)
- In `src/styles.css`, append inside `@layer base`:
  ```
  * { -webkit-tap-highlight-color: transparent; }
  img { content-visibility: auto; }
  ```

## Out of scope
- No backend/RLS changes; the server-side AI quota already exists.
- No changes to auto-generated Supabase files.
- No new packages.
