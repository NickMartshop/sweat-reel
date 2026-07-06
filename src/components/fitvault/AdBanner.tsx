import { useEffect } from "react";
import { usePremium } from "@/lib/premium-store";

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;
const AD_SLOT = import.meta.env.VITE_ADSENSE_AD_SLOT as string | undefined;

export function AdBanner() {
  const { isPremium } = usePremium();
  const configured = !!CLIENT_ID && CLIENT_ID !== "PENDING" && !!AD_SLOT && AD_SLOT !== "PENDING";

  useEffect(() => {
    if (isPremium || !configured) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, [isPremium, configured]);

  // Premium users never see ads.
  if (isPremium) return null;

  if (!configured) {
    return (
      <div
        className="my-4 rounded-xl flex items-center justify-center text-[11px] text-text-secondary"
        style={{
          minHeight: 72,
          border: "1px dashed #252535",
          background: "#0f0f1a",
        }}
      >
        Ad space — configure AdSense to monetize
      </div>
    );
  }

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
