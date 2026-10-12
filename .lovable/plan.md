# SweatReel first zero-cost global conversion experiment

## Readiness gate
- Before any landing-page change, confirm the reconciled source is present and the preview/build succeeds. Current preview route returned HTTP 200, but no successful build log is available yet.
- If the source is not reconciled or the build fails, stop before landing-page edits and report the blocker.

## Landing-page update
- Update only `src/components/fitvault/LandingScreen.tsx`; preserve the existing signup callback and auth flow.
- State the promise “Stop losing the workouts you save.” and present the requested three-step manual workflow.
- Clearly state AI extraction is temporarily unavailable; show no AI output or active AI promise.
- Use “Start your free workout library” as the primary action.
- Add a responsive product preview by reusing genuine SweatReel workout UI, clearly labeled as an example and without testimonials, user counts, or claimed outcomes.
- Replace visible FitVault branding only if present on this landing experience. Do not delete or alter stored user/workout data.
- Keep current routes, legal/payment behavior, integrations, and data model unchanged; add no tracking or packages.

## Validation and measurement
- Build and exercise the preview at desktop and phone widths; verify page text, CTA navigation into the existing signup/auth flow, and no horizontal overflow.
- Report the exact changed files and build/test results. Do not publish.
- No existing analytics SDK or landing/signup event was found in source. Explain that first-party account and workout records can count signups and first saved workouts, but cannot calculate visitor-to-signup conversion without a visitor denominator; add no tracking.
