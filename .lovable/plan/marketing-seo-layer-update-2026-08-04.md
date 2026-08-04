# Marketing & SEO layer update

Scope: metadata, a new logged-out landing screen, and a blog. No changes to the dashboard, workout data, payments, or app logic.

## 1. Canonical domain → sweatreel.com

Replace every `https://sweat-reel.lovable.app` reference with `https://sweatreel.com` across:
`src/routes/__root.tsx`, `index.tsx`, `auth.tsx`, `plans.tsx`, `progress.tsx`, `profile.tsx`, `gear.tsx`, `privacy.tsx`, `terms.tsx`, `delete-account.tsx`, `sitemap[.]xml.ts`, `src/lib/share-card.ts`, `public/robots.txt`, and the email preview route.

Note: `sweatreel.com` is not currently connected as a custom domain to this project. Once these tags ship, canonical/og URLs will point at a domain the published site doesn't serve yet — search engines will consolidate to sweatreel.com, so the domain should be connected in project settings soon after. I'll make the change as asked.

## 2. Meta tags

Homepage (`src/routes/index.tsx`) gets:

- Title: `Stop Losing Your Saved Workout Reels — SweatReel`
- Description: `You have 40 saved workout reels and you've done zero of them. SweatReel turns saved videos into an actual plan. Free.`
- `og:title` / `og:description` / `twitter:title` / `twitter:description` mirror those exact two lines.
- `og:url` + canonical → `https://sweatreel.com/`, `twitter:image` / `og:image` → a sweatreel.com path.

## 3. Logged-out landing screen

New `src/components/fitvault/LandingScreen.tsx`, shown by `AppShell` to visitors with no session, before the auth screen. It takes the slot the current onboarding screen occupies; authenticated users see the dashboard unchanged.

- Full screen, `#0A0A0F`, max-width 430px, mobile-first
- SR wordmark centered at top
- H1 32px bold white: "Your Saved Workouts Are a Graveyard."
- Sub-headline 16px `#8888AA`
- Three benefit rows, `#06D6A0` checkmark + white 15px text
- CTA button 56px, `linear-gradient(135deg,#4361EE,#7B2FBE)`, "Stop Losing Workouts →" → existing sign-up flow (sets auth mode to signup, same path the current Get Started button uses)
- Footnote 12px `#8888AA`: "Free forever. No credit card."

## 4. Blog

New routes:

- `src/routes/blog.index.tsx` — list of the 3 posts, dark theme, own head metadata
- `src/routes/blog.$slug.tsx` — post page, renders from a local `src/lib/blog-posts.ts` content module (title, description, body sections), with Article JSON-LD and self-referencing canonical/og:url

Posts (full body written in SweatReel's voice — direct, short sentences, no corporate tone), each ending with a CTA link back to the homepage:

1. `why-you-never-do-saved-workouts` — Why You Never Do the Workouts You Save on Instagram
2. `turn-reel-into-workout-plan` — How to Turn a Saved Reel Into a Real Workout Plan in Under 60 Seconds (numbered how-to of the actual product steps)
3. `best-apps-organize-saved-workout-videos` — Best Apps to Organize Saved Workout Videos in 2026 (positions SweatReel against JEFIT/Fitbod/Load Muscle for the saved-video backlog use case)

Sitemap gains `/blog` and all three post URLs.

## Technical notes

- Blog posts live as typed data in a plain TS module, so both list and detail routes read one source and the sitemap stays in sync.
- Landing screen is presentation-only; no store or auth logic changes beyond which screen renders when signed out.
- Blog routes are public and prerender-safe (no auth-protected loaders).
