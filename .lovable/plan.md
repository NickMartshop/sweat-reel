## Context / conflict to resolve first

Two things about your request don't fit this project as-is:

1. **There is no `index.html`.** This app is TanStack Start (SSR). Head tags and scripts are declared in `src/routes/__root.tsx` via the `head()` function, and SW registration runs from `src/lib/register-sw.ts` (called in a `useEffect` in the root component). Any registration must go there — not into an HTML file.
2. **Progressier currently owns the service worker.** In the last change we intentionally switched the manifest and SW to Progressier (`https://progressier.app/OL1ZjHYBZsZRj3uaEoiZ/sw.js`), and `register-sw.ts` was rewritten to *unregister* any `/sw.js` so Progressier's worker has sole control of scope `/`. Registering `/sw.js` again will race Progressier for the same scope, which typically ends with one worker overwriting the other and stale caches on returning users.

Only one service worker can own scope `/`. So I need you to pick before I implement.

## Options

**A. Keep Progressier, ignore this instruction.** Do nothing. Progressier's SW stays active, offline/install continues to work through Progressier. Recommended if you're happy with Progressier.

**B. Drop Progressier, use our own `/sw.js` (what this message literally asks).** Then I will:
- Remove the Progressier `<script>` from the `scripts` array in `src/routes/__root.tsx`.
- Remove the Progressier `<link rel="manifest">` and re-enable `{ rel: "manifest", href: "/manifest.json" }`.
- Rewrite `src/lib/register-sw.ts` to actually register `/sw.js` (scope `/`) on `window` load, keeping the existing guards so it does **not** register in dev, in iframes, on `id-preview--*` / `preview--*` / `*.lovableproject.com` / `*.lovableproject-dev.com` / `*.beta.lovable.dev`, or when `?sw=off` is present. In those refused contexts it will unregister any existing `/sw.js`. (Per Lovable's PWA rules, we can't inject a raw `<script>` that registers in preview.)
- Add a same-path kill-switch step so Progressier's previously-installed worker gets replaced cleanly for returning visitors (unregister any active SW whose scriptURL is on `progressier.app` on first load in production).
- Verify `public/manifest.json` — the icons already reference `/icon-192.png` and `/icon-512.png` with `"type": "image/png"`, so no change needed there. I'll just confirm.

**C. Hybrid (not recommended).** Keep Progressier's manifest but also register `/sw.js`. Two SWs will fight for scope `/`; expect stale-cache and update bugs. I'd only do this if you insist.

## Which do you want?

If you confirm **B**, I'll implement exactly the file changes above in one pass and leave everything else untouched. If **A**, no code change — I'll just close this out.
