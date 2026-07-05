import { useState } from "react";
import type { FitnessGoal } from "@/lib/profile-store";

interface Props {
  onDone: (goal: FitnessGoal | null) => void;
}

const slides = [
  {
    glow: "rgba(67,97,238,0.25)",
    title: "Save Any Workout",
    subtitle:
      "Paste links from YouTube, Instagram & TikTok. Build your personal workout library.",
  },
  {
    glow: "rgba(255,107,53,0.2)",
    title: "Plan Your Week",
    subtitle: "Schedule workouts for each day. Never miss leg day again.",
  },
  {
    glow: "rgba(6,214,160,0.2)",
    title: "Build Your Streak",
    subtitle:
      "Work out consistently. Track your progress. Become unstoppable.",
  },
];

const GOAL_OPTIONS: { key: FitnessGoal; label: string; emoji: string }[] = [
  { key: "build", label: "Build Muscle & Strength", emoji: "🏋️" },
  { key: "lose", label: "Lose Weight & Get Lean", emoji: "🔥" },
  { key: "flex", label: "Improve Flexibility & Recovery", emoji: "🧘" },
  { key: "general", label: "General Fitness & Health", emoji: "🏃" },
];

function Illustration({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div
        className="mx-auto rounded-[28px] border-2 border-white/80 bg-[#0A0A0F] p-3"
        style={{ width: 160, height: 260 }}
      >
        <div className="h-4 w-12 mx-auto rounded-full bg-[#252535] mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {["#4361EE","#FF6B35","#06D6A0","#EF476F","#4361EE","#FF6B35"].map((c, i) => (
            <div key={i} className="h-14 rounded-md" style={{ background: c, opacity: 0.85 }} />
          ))}
        </div>
      </div>
    );
  }
  if (index === 1) {
    const colors = ["#4361EE","transparent","#FF6B35","#06D6A0","transparent","#4361EE","transparent"];
    return (
      <div className="mx-auto rounded-2xl bg-[#141420] border border-[#252535] p-3" style={{ width: 240 }}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} className="text-[10px] text-[#8888AA] text-center font-semibold">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {colors.map((c, i) => (
            <div key={i} className="aspect-square rounded-md border border-[#252535]" style={{ background: c }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(6,214,160,0.3)", filter: "blur(20px)", animation: "fvPulse 2s ease-in-out infinite" }}
        />
        <span className="relative text-7xl">🔥</span>
      </div>
      <p className="mt-4 text-[64px] font-bold text-white leading-none">47</p>
      <p className="text-sm text-text-secondary mt-1">days</p>
      <style>{`@keyframes fvPulse { 0%,100% { transform: scale(1); opacity: .7;} 50% { transform: scale(1.15); opacity: 1;} }`}</style>
    </div>
  );
}

export function Onboarding({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const isGoalStep = idx === slides.length;
  const slide = slides[Math.min(idx, slides.length - 1)];
  const isLastIntro = idx === slides.length - 1;

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden flex flex-col">
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
        style={{
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${slide.glow} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      <button
        onClick={() => onDone(goal)}
        className="absolute top-4 right-4 z-10 text-[14px] text-text-secondary px-3 py-2"
        style={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        Skip
      </button>

      {isGoalStep ? (
        <div className="relative flex-1 flex flex-col justify-center px-6 pt-16">
          <h1 className="text-[24px] font-bold text-white text-center">
            One Quick Question
          </h1>
          <p className="mt-2 text-[16px] text-white/90 text-center">
            What's your main goal? 💪
          </p>
          <ul className="mt-6 space-y-3">
            {GOAL_OPTIONS.map((opt) => {
              const active = goal === opt.key;
              return (
                <li key={opt.key}>
                  <button
                    onClick={() => setGoal(opt.key)}
                    className="press-scale w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                    style={{
                      background: "#141420",
                      border: `2px solid ${active ? "#4361EE" : "#252535"}`,
                    }}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="flex-1 text-[16px] font-medium text-white">
                      {opt.label}
                    </span>
                    {active && (
                      <span className="text-primary text-lg font-bold">✓</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="relative flex-1 flex flex-col justify-center items-center px-8 text-center">
          <Illustration index={idx} />
          <h1 className="mt-6 text-[28px] font-bold text-white">{slide.title}</h1>
          <p className="mt-3 text-[15px] text-text-secondary leading-relaxed px-2">
            {slide.subtitle}
          </p>
        </div>
      )}

      <div className="relative pb-8 px-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}>
        <div className="flex justify-center gap-2 mb-6">
          {[...slides, "goal"].map((_, i) => (
            <span
              key={i}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === idx ? 24 : 8,
                background: i === idx ? "#4361EE" : "#252535",
              }}
            />
          ))}
        </div>

        {isGoalStep ? (
          <button
            onClick={() => onDone(goal)}
            disabled={!goal}
            className="press-scale w-full rounded-xl text-white font-semibold text-[16px] disabled:opacity-50"
            style={{ height: 56, background: "#4361EE" }}
          >
            Continue →
          </button>
        ) : isLastIntro ? (
          <button
            onClick={() => setIdx(idx + 1)}
            className="press-scale w-full rounded-xl text-white font-semibold text-[16px]"
            style={{ height: 56, background: "#FF6B35" }}
          >
            Get Started 💪
          </button>
        ) : (
          <button
            onClick={() => setIdx(idx + 1)}
            className="press-scale w-full rounded-xl text-white font-semibold text-[16px]"
            style={{ height: 56, background: "#4361EE" }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
