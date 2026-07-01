import { ChevronRight } from "lucide-react";

const AFFILIATE_URL = "https://www.amazon.in/s?k=gym+equipment&tag=sweatreel-21";

interface AffiliateBannerProps {
  isPro: boolean;
}

export function AffiliateBanner({ isPro }: AffiliateBannerProps) {
  if (isPro) return null;

  return (
    <a
      href={AFFILIATE_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="fixed left-0 right-0 z-30 flex items-center justify-between px-4 press-scale"
      style={{
        bottom: "calc(72px + env(safe-area-inset-bottom))",
        background: "#141420",
        borderTop: "1px solid #252535",
        height: "52px",
      }}
    >
      <span className="text-[13px] text-white font-medium">
        Amazon Fitness Gear
      </span>
      <span className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "#4361EE" }}>
        Shop Now
        <ChevronRight size={16} />
      </span>
    </a>
  );
}
