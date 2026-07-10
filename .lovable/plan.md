## Goal
Integrate Progressier (manifest + script + service worker) into SweatReel, using the exact URLs provided.

## Changes

### 1. `src/routes/__root.tsx` (replaces the missing `index.html`)
TanStack Start has no `index.html` — head tags live in the route `head()`. In the existing `head()`:

- **Comment out** the current manifest link so it doesn't conflict with Progressier's:
  - `// { rel: "manifest", href: "/manifest.json" }, // disabled: replaced by Progressier`
- **Add** the Progressier manifest link:
  - `{ rel: "manifest", href: "https://progressier.app/OL1ZjHYBZsZRj3uaEoiZ/progressier.json" }`
- **Add** the Progressier script into the existing `scripts` array:
  - `{ src: "https://progressier.app/OL1ZjHYBZsZRj3uaEoiZ/script.js", defer: true }`

No other Progressier IDs exist in the codebase, so nothing else needs updating (Rule 1 satisfied). Only one existing manifest exists (`/manifest.json`) — commented out per Rule 2. URLs used verbatim per Rule 3.

### 2. `public/progressier.js` (new)
Single line, exactly:
```
importScripts("https://progressier.app/OL1ZjHYBZsZRj3uaEoiZ/sw.js")
```

### 3. Existing service worker (`public/sw.js` + `src/lib/register-sw.ts`)
Progressier's own script auto-registers `progressier.js` as the service worker. Our existing `sw.js` registration would compete for the same scope (`/`) and cause conflicts.

- Stop calling `registerSw()` from `RootComponent` in `__root.tsx` (remove the `useEffect` that imports `register-sw`).
- Leave `public/sw.js` in place but make `register-sw.ts` proactively **unregister** any existing `/sw.js` on load (it already has an `unregisterExisting` helper) — this cleans up returning users who installed the old worker. Actually simpler: replace the effect with a one-time unregister-only call.

This ensures Progressier's SW is the only one active.

## Explicitly NOT doing
- Not editing `index.html` (doesn't exist in TanStack Start).
- Not modifying the Progressier URLs, IDs, or file contents.
- Not deleting `public/manifest.json` or `public/sw.js` — just disconnecting them.

## Verify
- Build passes.
- `/progressier.js` fetches and returns the `importScripts(...)` line.
- Head contains the Progressier manifest link and script tag; old manifest link is commented out.
- In production, only the Progressier service worker is registered.
