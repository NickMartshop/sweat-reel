
## Notes
This project has no `index.html` — it's TanStack Start with SSR. Head tags are set in `src/routes/__root.tsx`. I'll inject the AdSense script there so it renders in `<head>` on every page, which is the correct equivalent.

## Changes

1. **`src/routes/__root.tsx`** — Add the AdSense script unconditionally to the `scripts` array in `head()`:
   ```
   {
     src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7298096903500162",
     async: true,
     crossOrigin: "anonymous",
   }
   ```
   Remove the previous conditional AdSense loader block (which gated on `VITE_ADSENSE_CLIENT_ID`) to avoid loading the script twice. Also set `VITE_ADSENSE_CLIENT_ID="ca-pub-7298096903500162"` in `.env` so `AdBanner.tsx` renders real `<ins>` slots instead of the placeholder (ad slot ID stays `PENDING` until you provide one).

2. **`.env`** — Replace the `VITE_RAZORPAY_KEY_ID` line with:
   ```
   VITE_RAZORPAY_KEY_ID="rzp_live_TAYkuahmg70Tib"
   ```
   `UpgradeSheet.tsx` already reads `import.meta.env.VITE_RAZORPAY_KEY_ID`, so it'll be picked up on next dev-server restart.

## Security note
Publishing a **live** Razorpay Key ID in the repo `.env` is fine (Key ID is public), but confirm this is intentional — anyone who forks the repo will trigger real charges against your Razorpay account until you rotate it.

Confirm and I'll apply.
