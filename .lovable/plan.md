## Problem
The `/.well-known/assetlinks.json` file required for Android Play Store Digital Asset Links is currently being redirected to the SPA index.html. This breaks Play Store integration.

## Current State
- `vercel.json` does not exist in the project root.
- The public rewrite rules are likely handled by TanStack Start / Vite defaults.

## Plan
Create `vercel.json` in the project root with the exact rewrite and header rules provided:

1. **Rewrites section**: Add a rewrite rule with the exact source pattern:
   `"source": "/((?!api|_next|sw\\.js|manifest\\.json|icon.*|screenshot.*|robots\\.txt|sitemap\\.xml|\\.well-known).*)"`
   This excludes `.well-known` (and other static assets) from the SPA catch-all.

2. **Headers section**: Add a header rule for `/.well-known/assetlinks.json` with:
   - `Content-Type: application/json`
   - `Access-Control-Allow-Origin: *`
   - `Cache-Control: public, max-age=3600`

No other files or functionality will be changed.