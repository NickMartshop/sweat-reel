## Switch PWA to Progressier (new ID `y6aoSzd2PvHcOUlczvbM`)

Currently the app registers its own `/sw.js` and links `/manifest.json`. Progressier's previous ID (`OL1ZjHYBZsZRj3uaEoiZ`) still lives in `public/progressier.js`. Per your rules, I'll update the existing Progressier assets to the new ID, comment out the self-hosted manifest, and hand scope `/` back to Progressier.

### Changes

1. **`src/routes/__root.tsx` — head**
   - Add `<link rel="manifest" href="https://progressier.app/y6aoSzd2PvHcOUlczvbM/progressier.json">` (via `links`).
   - Comment out the existing `{ rel: "manifest", href: "/manifest.json" }` entry.
   - Add `<script defer src="https://progressier.app/y6aoSzd2PvHcOUlczvbM/script.js"></script>` (via `scripts`, `defer: true`).

2. **`public/progressier.js`**
   - Update to: `importScripts("https://progressier.app/y6aoSzd2PvHcOUlczvbM/sw.js")` (replaces old `OL1ZjHYBZsZRj3uaEoiZ` ID per rule #1).

3. **`src/lib/register-sw.ts`**
   - Stop registering our own `/sw.js`. Rewrite to unregister any existing `/sw.js` registration so it doesn't fight Progressier for scope `/`. Keep existing Lovable preview/dev/iframe guards intact.
   - Progressier's own script handles registering its worker; we don't register it manually.

4. **`src/routes/__root.tsx` — RootComponent effect**
   - Keep the `registerSw()` call (now acts as cleanup for the legacy `/sw.js`).

### Not changed
- `public/sw.js` and `public/manifest.json` stay on disk (unreferenced) — safe, and avoids removing files you may still want.
- No other files touched.
