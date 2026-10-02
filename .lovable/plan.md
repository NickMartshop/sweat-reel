# SweatReel final website compliance and deployment

## Scope
Modify only the five approved project paths. The Android application and all other website behavior remain unchanged.

## Legal pages
- Rewrite `/privacy` with effective date September 30, 2026 and only the approved data, AI gateway, YouTube oEmbed, Amazon affiliate, Android advertising, deletion, security, retention, and contact facts.
- Rewrite `/terms` as an 11-clause agreement covering service use, accounts, acceptable use, user content, AI output, payments, Amazon affiliate links, Android advertising, warranties, liability, changes, and contact.
- Rewrite `/delete-account` with the exact in-app path, verified email-request alternative, deleted-data categories, cautious legally required retention language, and Privacy/Terms links.
- Preserve each route’s `https://sweatreel.com` canonical URL and add complete route-specific social metadata where missing.

## Root and Android association cleanup
- Remove the unsupported aggregate rating and the AdSense loader.
- Narrow the content security policy by removing advertising, tag-manager, and generative-language origins while preserving the web Razorpay checkout origins and existing first-party/backend requirements.
- Keep all root website URLs on `https://sweatreel.com`.
- Delete the obsolete Android asset association file without replacing it.

## Validation and release
- Scan the five approved source paths and generated output for every obsolete string and claim listed in the request.
- Confirm the project build succeeds through the preview build signal.
- Check the latest security scan before publishing, then publish this existing SweatReel project.
- Verify the three production URLs return successfully, contain the required compliance facts, and contain none of the obsolete strings.

## Assumptions
- “Approved 11-clause version” means the eleven subjects explicitly listed in this request, without adding unapproved pricing, renewal, refund, retention-period, medical, or geographic terms.
- The existing web/iOS Razorpay flow remains active, so its checkout origins stay allowed; Android is explicitly excluded from that payment flow.
