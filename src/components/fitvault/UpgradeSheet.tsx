import { useEffect, useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "@/lib/auth-store";
import { premiumStore } from "@/lib/premium-store";
import { profileStore } from "@/lib/profile-store";
import { toast } from "./Toast";

export type UpgradeTrigger =
  | "library_limit"
  | "ai_limit"
  | "plans_locked"
  | "manual";

const HEADLINES: Record<UpgradeTrigger, string> = {
  library_limit: "You've hit your workout limit",
  ai_limit: "You've used all free AI extractions",
  plans_locked: "Unlock your full week",
  manual: "Upgrade to SweatReel Pro",
};

interface Props {
  open: boolean;
  onClose: () => void;
  trigger?: UpgradeTrigger;
}

const FEATURES: { label: string; free: string; pro: string }[] = [
  { label: "Workout saves", free: "15 max", pro: "Unlimited" },
  { label: "AI extractions", free: "3 total", pro: "Unlimited" },
  { label: "Weekly planner", free: "3 days", pro: "Full 7 days" },
  { label: "Ads", free: "Shown", pro: "Zero ads" },
  { label: "Progress stats", free: "Basic", pro: "Advanced" },
];

export function UpgradeSheet({ open, onClose, trigger = "manual" }: Props) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [cycle, setCycle] = useState<"monthly" | "annual">("annual");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 350);
    return () => clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  const canClose = trigger !== "library_limit";

  async function handleRestore() {
    const input = window.prompt(
      "Enter your Razorpay Payment ID\n(from your payment confirmation email, format: pay_XXXXXXXX)",
    );
    if (!input) return;
    const paymentId = input.trim();
    const user = authStore.get().user;
    if (!user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, premium_expires_at")
        .eq("razorpay_payment_id", paymentId)
        .maybeSingle();
      if (data && (data as any).id === user.id) {
        toast.success("Purchase restored! ✅");
        await premiumStore.refreshPremium(user.id);
      } else if (data) {
        toast.error("This payment belongs to a different account.");
      } else {
        toast.error("Payment ID not found. Contact support@sweatreel.com");
      }
    } catch {
      toast.error("Couldn't verify. Try again.");
    }
  }

  async function handleUpgrade() {
    const user = authStore.get().user;
    if (!user) {
      toast.error("Sign in first");
      return;
    }
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    // KEY_ID only — secret key must NEVER be in frontend
    if (!keyId || keyId === "PENDING") {
      toast.error("Payments not configured. Add VITE_RAZORPAY_KEY_ID.");
      return;
    }
    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Payment library didn't load. Check your internet.");
      return;
    }

    const amount = cycle === "annual" ? 99900 : 14900;
    const planLabel =
      cycle === "annual" ? "SweatReel Pro Annual" : "SweatReel Pro Monthly";
    setIsProcessing(true);

    try {
      const profile = profileStore.get().profile;
      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency: "INR",
        name: "SweatReel",
        description: planLabel,
        image: "/icon-192.png",
        prefill: {
          email: user.email || "",
          name: profile?.name || "",
        },
        theme: { color: "#4361EE" },
        modal: {
          ondismiss: () => setIsProcessing(false),
          escape: false,
        },
        handler: async (response) => {
          const paymentId = response.razorpay_payment_id;
          if (!paymentId) {
            toast.error("Payment failed. Please try again.");
            setIsProcessing(false);
            return;
          }
          // Dedupe: prevent double-application of the same payment.
          const { data: existing } = await supabase
            .from("profiles")
            .select("razorpay_payment_id")
            .eq("id", user.id)
            .maybeSingle();
          if (
            existing &&
            (existing as any).razorpay_payment_id === paymentId
          ) {
            toast.info("This payment was already applied.");
            setIsProcessing(false);
            return;
          }
          const now = new Date();
          const ms =
            cycle === "annual"
              ? 365 * 24 * 60 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000;
          const expiresAt = new Date(now.getTime() + ms);
          const { error } = await supabase
            .from("profiles")
            .update({
              is_premium: true,
              premium_plan: cycle,
              premium_expires_at: expiresAt.toISOString(),
              razorpay_payment_id: paymentId,
            } as any)
            .eq("id", user.id);
          if (error) {
            toast.error(
              "Payment received but activation failed. Email support@sweatreel.com with ID: " +
                paymentId,
            );
            setIsProcessing(false);
            return;
          }
          await premiumStore.refreshPremium(user.id);
          setIsProcessing(false);
          onClose();
          premiumStore.fireSuccess();
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        toast.error(
          "Payment failed: " +
            (resp?.error?.description || "Please try again."),
        );
        setIsProcessing(false);
      });
      rzp.open();
    } catch {
      toast.error("Could not open payment. Check your internet.");
      setIsProcessing(false);
    }
  }

  const priceHead =
    cycle === "annual" ? "₹999 / year" : "₹149 / month";
  const priceSub =
    cycle === "annual"
      ? "= ₹83/month · Billed once yearly"
      : "Billed monthly, cancel anytime";

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        onClick={canClose ? onClose : undefined}
        className={
          "absolute inset-0 bg-black/60 transition-opacity duration-300 " +
          (visible ? "opacity-100" : "opacity-0")
        }
      />
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <div
          className={
            "pointer-events-auto w-full max-w-[430px] bg-background border-t border-border rounded-t-3xl px-5 pb-6 transition-transform duration-350 ease-out " +
            (visible ? "translate-y-0" : "translate-y-full")
          }
          style={{
            paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
            maxHeight: "92vh",
            overflowY: "auto",
          }}
        >
          <div className="mx-auto my-3 w-10 h-1 rounded-full bg-[#252535]" />

          {canClose && (
            <button
              aria-label="Close"
              onClick={onClose}
              className="press-scale absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-text-secondary"
            >
              <X size={20} />
            </button>
          )}

          <div className="text-center pt-1">
            <p className="text-5xl">⚡</p>
            <h2 className="mt-2 text-[20px] font-bold text-white">
              {HEADLINES[trigger]}
            </h2>
            <p className="mt-1 text-[13px] text-text-secondary">
              Everything you need to train smarter
            </p>
          </div>

          {/* Feature comparison */}
          <div className="mt-5 rounded-2xl overflow-hidden border border-border">
            <div className="grid grid-cols-3 bg-[#252535] text-[11px] font-semibold uppercase text-text-secondary">
              <div className="px-3 py-2">Feature</div>
              <div className="px-3 py-2 text-center">Free</div>
              <div className="px-3 py-2 text-center">Pro ⚡</div>
            </div>
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className="grid grid-cols-3 text-[12px]"
                style={{ background: i % 2 ? "#0f0f1a" : "#141420" }}
              >
                <div className="px-3 py-2.5 text-white">{f.label}</div>
                <div className="px-3 py-2.5 text-center text-text-secondary">
                  {f.free}
                </div>
                <div
                  className="px-3 py-2.5 text-center"
                  style={{ color: "#06D6A0" }}
                >
                  ✅ {f.pro}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing toggle */}
          <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#141420]">
            <button
              onClick={() => setCycle("monthly")}
              className="press-scale h-10 rounded-lg text-[13px] font-semibold"
              style={{
                background: cycle === "monthly" ? "#4361EE" : "transparent",
                color: cycle === "monthly" ? "#fff" : "#8888AA",
              }}
            >
              Monthly ₹149
            </button>
            <button
              onClick={() => setCycle("annual")}
              className="press-scale h-10 rounded-lg text-[13px] font-semibold relative"
              style={{
                background: cycle === "annual" ? "#4361EE" : "transparent",
                color: cycle === "annual" ? "#fff" : "#8888AA",
              }}
            >
              Annual ₹999 ✦
              <span
                className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                style={{ background: "#06D6A0" }}
              >
                SAVE 44%
              </span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[32px] font-bold text-white leading-none">
              {priceHead}
            </p>
            {cycle === "annual" && (
              <p className="mt-1 text-[13px] text-text-secondary">
                <span className="line-through">₹1,788</span>{" "}
                <span style={{ color: "#06D6A0" }}>Save ₹789</span>
              </p>
            )}
            <p className="mt-1 text-[12px] text-text-secondary">{priceSub}</p>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="mt-5 w-full h-14 rounded-2xl text-[17px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-80"
            style={{
              background: isProcessing
                ? "#252535"
                : "linear-gradient(135deg, #4361EE, #7B2FBE)",
              boxShadow: isProcessing
                ? "none"
                : "0 6px 24px rgba(67,97,238,0.4)",
              animation: isProcessing ? "none" : "pulseCta 2.5s ease-in-out infinite",
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Opening payment...
              </>
            ) : (
              <>
                Upgrade Now <Sparkles size={16} />
              </>
            )}
          </button>

          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-text-secondary">
            <button onClick={handleRestore} className="press-scale">
              Restore Purchase
            </button>
            <span>·</span>
            <span>🔒 Secure · Razorpay</span>
          </div>

          <style>{`
            @keyframes pulseCta {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
