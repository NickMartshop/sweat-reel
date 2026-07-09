## Goal
Make SweatReel score well on PWABuilder / packageable as an Android APK, adapted to this stack (TanStack Start on Cloudflare via Lovable — no `index.html`, no Vercel).

## Changes

### 1. `public/manifest.json`
Replace verbatim with the JSON you provided (adds `scope`, `id`, moves start_url to `?utm_source=pwa&utm_medium=homescreen`, adds shortcut descriptions, splits maskable into its own icon entry).

### 2. Service worker (preview-safe)
- Add `public/sw.js` with your exact contents.
- Add `src/lib/register-sw.ts` — guarded wrapper that only registers when: `import.meta.env.PROD`, not in an iframe, hostname is not `id-preview--*` / `preview--*` / `*.lovableproject.com` / `*.lovableproject-dev.com` / `*.beta.lovable.dev`, and no `?sw=off`. In any refused context, unregister `/sw.js` if present. This prevents SW from breaking the Lovable editor iframe.
- Call `registerSw()` from a `useEffect` in `RootComponent` (`src/routes/__root.tsx`).

### 3. Head metadata in `src/routes/__root.tsx`
Extend the existing `head()` (do not add a second mechanism):
- Meta: `application-name`, `apple-mobile-web-app-title`, `msapplication-TileImage`, `msapplication-TileColor`. (`apple-mobile-web-app-capable` + status-bar-style already present.)
- Links: `apple-touch-icon` → `/icon-192.png`.
- Add a `MobileApplication` JSON-LD script alongside the existing Organization/WebSite graph (single JSON-LD script, extend the `@graph`). Uses `sweat-reel.lovable.app` (our real domain), not vercel.app.

### 4. Razorpay guard + dev-only debug row
- In `UpgradeSheet.tsx`, before `new window.Razorpay(...)`: if `import.meta.env.VITE_RAZORPAY_KEY_ID` is falsy or `"undefined"`, toast `"Payment temporarily unavailable. Please try later."` and return. (Server function still owns the real `keyId`; this only prevents opening checkout when misconfigured.)
- In `src/routes/profile.tsx`, add a "Test Payment Config" settings row visible only when `import.meta.env.DEV`; onClick logs `Razorpay key configured: <boolean>`.

### 5. Runtime hydration fix (quiet)
`OfflineBanner` currently renders a `fixed` div at SSR that clashes with the `<main>` server HTML. Guard it with `useHydrated()` (or return `null` until mounted) so SSR and client agree.

## Explicitly NOT doing (would break the stack)
- **No `index.html` edits** — doesn't exist. Meta/JSON-LD/SW registration go through `__root.tsx` per TanStack Start.
- **No `vercel.json`** — app deploys on Cloudflare Workers via Lovable, not Vercel. Headers already set via CSP meta in `__root.tsx`; SPA rewrites unnecessary (file-based router handles it).
- **No overwrite of `public/robots.txt` or `public/sitemap.xml`** — current versions correctly point to `sweat-reel.lovable.app` and already list more routes (`/plans`, `/profile`, `/progress`, `/gear`, `/mcp`, etc.). Replacing them with your `vercel.app` 3-URL versions would be a regression. Domain in your prompt (`sweat-reel.vercel.app`) is not this project's URL.

## Verify
- Build passes.
- `/sw.js` and `/manifest.json` fetch successfully.
- Hydration error gone on `/`.
- PWABuilder against `https://sweat-reel.lovable.app` shows improved manifest/SW score.
