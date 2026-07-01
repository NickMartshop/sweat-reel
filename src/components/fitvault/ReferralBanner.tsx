import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { getReferralShareUrl } from "@/lib/share-utils";

const STORAGE_KEY = "referral_banner_dismissed";

export function ReferralBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== "true") {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!visible) return null;

  return (
    <a
      href={getReferralShareUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block mt-4 rounded-xl p-[14px_16px] press-scale"
      style={{
        background: "linear-gradient(135deg, #4361EE, #7B2FBE)",
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDismiss();
        }}
        aria-label="Dismiss"
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle size={20} className="text-white" />
        </div>
        <div className="min-w-0 pr-6">
          <p className="text-[14px] font-semibold text-white">
            Share SweatReel, help a friend get fit
          </p>
          <p className="text-[12px] text-white/80 mt-0.5">
            Tap to share on WhatsApp
          </p>
        </div>
      </div>
    </a>
  );
}
