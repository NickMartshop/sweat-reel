## Findings from the initial audit

I checked the current auth code paths, backend status, auth/profile triggers, RLS policies, middleware registration, and deployed auth pages.

Likely root causes to address:

1. **Deployed site is probably using the wrong backend project/config**
   - The user reports no users are created in the expected Authentication Users view.
   - The Lovable backend is healthy and the local project configuration points to the Lovable Cloud backend.
   - A Vercel deployment can still be built with stale or different `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, causing sign-up/sign-in to hit a different auth backend.

2. **Sign-up currently hides the real provider error**
   - `AuthScreen` maps most errors to a generic “Something went wrong. Try again.”
   - This prevents identifying whether the live failure is disabled signups, invalid API key, redirect URL, email provider, rate limit, or another provider-side issue.

3. **Profile auto-create trigger exists, but should be made idempotently self-healing**
   - The trigger is present on auth user creation and the function exists.
   - I will still add a safe self-healing migration to recreate the trigger/function with a fully qualified function call and keep revoke hardening, so future drift cannot silently break profiles.

4. **Auth state exists in a standalone custom store rather than the router root context**
   - This is workable, but it has duplicated auth surfaces (`/auth` route and `AppShell`) and no centralized debug visibility.
   - I will keep existing UX, but make the store more reliable and explicit about session restoration.

5. **Protected server functions are wired correctly in principle**
   - `requireSupabaseAuth` is used by server functions.
   - `attachSupabaseAuth` is registered in `src/start.ts`.
   - I will harden JWT verification and bearer attachment behavior if needed, but avoid rewriting generated files unless necessary.

6. **Vercel config contains legacy SPA rewrite behavior**
   - This project is TanStack Start, not a classic SPA.
   - The rewrite may not be the direct auth failure, but it is deployment-sensitive and can conflict with server routes or SSR behavior. I will replace it with a safer minimal config that preserves `.well-known` and headers without forcing all routes to `/index.html`.

## Implementation plan

### 1. Instrument auth errors safely
- Update the auth screen to preserve user-friendly messages while logging only safe diagnostics:
  - auth error code
  - HTTP status if present
  - high-level message category
- Do not log secrets, tokens, or full raw objects.
- Improve `friendlyAuthError()` so common deployment/provider failures show useful text instead of only “Something went wrong.”

### 2. Harden sign-up and sign-in flow
- Keep email/password auth as the current app flow.
- Normalize email before auth calls.
- Use `emailRedirectTo: window.location.origin + "/auth"` for sign-up confirmation returns instead of the bare origin.
- After sign-up/sign-in, explicitly call session/user restoration (`getSession()` and/or `getUser()`) before navigating, so the custom auth store catches the authenticated state reliably.
- Add a lightweight “auth diagnostics” helper for client-safe checks of the configured URL/ref at runtime without exposing secrets.

### 3. Make auth store session restoration reliable
- Refactor `src/lib/auth-store.ts` to:
  - initialize once
  - call `getSession()` on load
  - validate signed-in state with `getUser()` where trust matters
  - update subscribers on `SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`
  - avoid async work inside `onAuthStateChange` that can block auth event handling
- Keep existing onboarding behavior and local storage keys intact.

### 4. Self-heal profile creation on sign-up
- Add a database migration that:
  - recreates `public.handle_new_user()` safely
  - recreates `on_auth_user_created` on `auth.users`
  - ensures profile insert is conflict-safe
  - preserves security hardening by revoking direct public/authenticated execution
- Confirm RLS policies and grants still allow signed-in users to read/update only their own profile.

### 5. Verify and adjust auth provider configuration
- Use the auth configuration tool to ensure:
  - signups are enabled
  - email/password auth is usable
  - leaked-password protection is enabled
  - auto-confirm is not enabled unless explicitly requested
- Check OAuth/server settings already present for MCP consent route consistency, but do not replace the email/password flow.

### 6. Fix deployment-sensitive Vercel configuration
- Replace the legacy SPA rewrite in `vercel.json` with TanStack-safe configuration:
  - keep `.well-known/assetlinks.json` content type/header support
  - keep HSTS
  - avoid rewriting all app routes to `/index.html`
- This prevents deployed auth/API/server routes from being served inconsistently.

### 7. Validate backend and database paths
- Re-check:
  - auth trigger exists and is enabled
  - profile trigger function exists
  - RLS policies on profiles/workouts/plans/completions/body stats
  - required grants
  - backend health
  - recent auth logs

### 8. End-to-end verification
- In Lovable preview:
  - load `/auth`
  - test sign-up with a fresh test email
  - confirm a user record exists in Authentication Users
  - confirm a matching profile row exists
  - test sign-in with that account
  - confirm session persists after reload
- For Vercel:
  - inspect the deployed bundle/runtime configuration where possible
  - verify `/auth` loads without client-side config errors
  - provide exact Vercel environment variables to correct if the deployed bundle still points at the wrong backend

## Files expected to change

- `src/components/fitvault/AuthScreen.tsx`
- `src/lib/auth-store.ts`
- `vercel.json`
- possibly `src/start.ts` or auth middleware only if verification shows bearer/JWT issues
- one new database migration for auth/profile trigger self-healing

## Configuration expected to change

- Lovable Cloud auth settings may be updated to keep signups enabled and enable leaked-password checks.
- If Vercel is using stale/wrong environment variables, I will identify the exact variable names and expected values for the user to update in Vercel.

## Success criteria

- Sign-up produces a real auth user.
- Profile row is created automatically.
- Sign-in succeeds with the new credentials.
- Session persists across refresh.
- Protected server functions receive bearer tokens correctly.
- The app works in Lovable preview and the deployed Vercel site, or any remaining blocker is clearly identified as external deployment configuration with exact remediation steps.