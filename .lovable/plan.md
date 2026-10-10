# SweatReel final no-cost AI disclosure and release

## Copy updates
- Update the Privacy Policy to say AI extraction is temporarily unavailable and, while disabled, the extraction feature sends no workout information to an AI provider.
- Describe the conditional future flow without promising activation: if re-enabled, workout title, source URL, and platform context would pass through the Supabase Edge Function to the OpenAI API.
- Apply the same availability and conditional-processing wording to the Terms and Delete Account service disclosure.
- Replace the logged-out homepage statements that currently present AI extraction as active with accurate unavailable-state copy, without changing the page design.
- Preserve the existing Supabase, YouTube oEmbed, Amazon affiliate, account-deletion, Razorpay iOS/web-only, and Android no-ads disclosures. Add no retention, training, storage, analytics, tracking, advertising, or paid-service claims.

## Validation
- Scan the changed pages for active-tense AI extraction claims and confirm the required unavailable-state wording is present.
- Verify the Privacy, Terms, Delete Account, and logged-out homepage render correctly in the preview.
- Confirm the automatic website build is successful before release.

## Publish and live checks
- Publish the current build to the existing SweatReel project.
- Verify the published SweatReel URL and all three legal routes return successfully with the updated wording.
- Check `https://sweatreel.com` and its three legal routes separately. Report the custom domain as updated only if those live responses contain the new disclosure; otherwise report the exact domain action still required.

## Expected changed files
- `src/routes/privacy.tsx`
- `src/routes/terms.tsx`
- `src/routes/delete-account.tsx`
- `src/components/fitvault/LandingScreen.tsx`
