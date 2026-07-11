## Add `/delete-account` public page (Play Store compliance)

Create a new public TanStack route that documents how users delete their SweatReel account and data. No auth, no redirects, indexable.

### Files

1. **`src/routes/delete-account.tsx`** (new)
   - `createFileRoute("/delete-account")` with full `head()`:
     - `title`: "Delete Your SweatReel Account"
     - `description`: "Permanently delete your SweatReel account and personal data. Step-by-step instructions and support contact."
     - matching `og:title`, `og:description`, `og:url`, `og:type=website`, `twitter:card`
     - `link rel="canonical"` → `https://sweat-reel.lovable.app/delete-account`
     - `robots: index, follow`
   - Component: dark-themed, mobile-first, matches existing `privacy.tsx` / `terms.tsx` styling (bg-background, text tokens, max-w container, semantic `<main>`, single `<h1>`, `<h2>` sections).
   - Sections:
     1. Intro paragraph
     2. **How to delete your account** — ordered list (Open app → Profile → Settings → Delete Account → Confirm)
     3. **Can't access your account?** — mailto link to `support@sweatreel.com`
     4. **What gets deleted** — bullet list (account info, saved plans, saved videos, profile, user-generated data)
     5. **Data retention** — note that legally-required data is retained only for the minimum required period
     6. Footer links: Privacy Policy (`/privacy`), Terms (`/terms`), Home (`/`) using `<Link>`

2. **`src/routes/sitemap[.]xml.ts`** — add `/delete-account` entry (weekly, priority 0.5).

3. **`src/routes/privacy.tsx`** — add a small link to `/delete-account` in the account/data section (helps discoverability + Play Store review).

### Notes
- Uses project domain `sweat-reel.lovable.app` for canonical/og:url (per project head-meta rules). The user's referenced `sweatreel.com` isn't a configured custom domain; canonical will resolve correctly once it is.
- No `og:image` — leaves hosting default in place.
- Verification: after build, `curl -I /delete-account` → 200; sitemap contains the new URL.
