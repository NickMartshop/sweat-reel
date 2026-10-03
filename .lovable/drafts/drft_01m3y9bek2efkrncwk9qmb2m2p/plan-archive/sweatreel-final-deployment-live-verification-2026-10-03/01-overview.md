# SweatReel — Final Deployment & Live Verification

The compliance patch is complete and the preview build is clean. This plan covers only the remaining step: publish the existing SweatReel project and verify the three live legal pages on the custom domain.

No code changes. No Android repo or AAB changes. No new project.

## Steps

1. **Publish the existing project** — deploy the current build (including the approved privacy, terms, and delete-account pages) to production.
2. **Verify the three live URLs** — fetch each page and confirm it serves correctly over HTTPS:
   - `https://sweatreel.com/privacy`
   - `https://sweatreel.com/terms`
   - `https://sweatreel.com/delete-account`
3. **Content checks per page** — confirm each rendered page contains:
   - HTTP 200 over HTTPS
   - Effective date: September 30, 2026
   - support@sweatreel.com contact
   - Amazon affiliate disclosure
   - "No third-party advertising SDK / no ads" statement
   - AI gateway disclosure
   - YouTube oEmbed disclosure
   - Razorpay Android exclusion (iOS/web only)
   - Profile → Delete Account path
4. **Obsolete-string scan** — confirm none of the removed strings appear in live HTML: AdSense loader, Gemini/generative-language origins, aggregateRating, lovable.app URLs, placeholder text.

## Possible blocker

If `sweatreel.com` is not yet connected as a custom domain on this project, the live-URL verification cannot pass. In that case I will stop at that step and report the exact action needed in Project Settings → Domains (connect the domain and add the DNS records at your registrar). The Lovable URL publish itself does not depend on the custom domain.

## Deliverable

Deployment URL plus a PASS/FAIL table for every check on all three pages.
