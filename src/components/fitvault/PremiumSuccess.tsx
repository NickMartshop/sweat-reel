import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { premiumStore, usePremium } from "@/lib/premium-store";

const COLORS = ["#4361EE", "#FF6B35", "#06D6A0", "#FFD166", "#7B2FBE"];

function useConfetti(active: boolean) {
  return useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      drift: (Math.random() - 0.5) * 40,
      size: 6 + Math.random() * 6,
      height: 10 + Math.random() * 10,
      rot: Math.random() * 360,
      dur: 2 + Math.random() * 2,
      delay: Math.random() * 2,
      color: COLORS[i % COLORS.length],
      round: i % 2 === 0,
    }));
  }, [active]);
}

export function PremiumSuccessHost() {
  const [open, setOpen] = useState(false);
  useEffect(() => premiumStore.onSuccess(() => setOpen(true)), []);
  return open ? <PremiumSuccessOverlay onClose={() => setOpen(false)} /> : null;
}

function PremiumSuccessOverlay({ onClose }: { onClose: () => void }) {
  const { plan, expiresAt } = usePremium();
  const navigate = useNavigate();
  const confetti = useConfetti(true);

  useEffect(() => {
    const t = setTimeout(() => onClose(), 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  const planLabel = plan === "annual" ? "Annual" : plan === "monthly" ? "Monthly" : "Pro";
  const expLabel = expiresAt
    ? expiresAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between px-6 py-10 overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 30%, #1A0A2E, #0A0A0F)" }}
    >
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="absolute top-0"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.height,
              background: c.color,
              borderRadius: c.round ? "50%" : "3px",
              animation: `srFall ${c.dur}s linear ${c.delay}s forwards`,
              transform: `translate(0,-20px) rotate(${c.rot}deg)`,
              // @ts-expect-error CSS var
              "--drift": `${c.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div style={{ filter: "drop-shadow(0 0 30px #FFD166)" }} className="text-[80px] leading-none">
          ⚡
        </div>
        <h2 className="mt-4 text-[30px] font-bold text-white">You're Pro now! 🎉</h2>
        <p className="mt-1 text-[14px] text-text-secondary">Welcome to SweatReel Pro</p>

        <div className="mt-6 flex gap-6">
          {[
            { v: "∞", l: "Workouts" },
            { v: "7", l: "Days" },
            { v: "0", l: "Ads" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center">
              <span className="text-[28px] font-bold text-white leading-none">{s.v}</span>
              <span className="mt-1 text-[11px] text-text-secondary">{s.l}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-4 px-4 py-2 rounded-full border border-border"
          style={{ background: "#141420" }}
        >
          <span className="text-[12px] text-text-secondary">
            {planLabel} Plan · Expires {expLabel}
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          onClose();
          navigate({ to: "/" });
        }}
        className="press-scale w-full max-w-[380px] h-14 rounded-2xl text-[16px] font-semibold text-white"
        style={{
          background: "#FF6B35",
          boxShadow: "0 6px 24px rgba(255,107,53,0.5)",
        }}
      >
        Start Training 🔥
      </button>

      <style>{`
        @keyframes srFall {
          0% { transform: translate(0,-20px) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift, 0), 110vh) rotate(720deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
