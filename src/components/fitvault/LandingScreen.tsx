import { Check } from "lucide-react";

interface Props {
  onGetStarted: () => void;
}

const BENEFITS = [
  "Open one app before you lift — not eleven saved Reels tabs you can never find again",
  "AI reads the video and writes your sets and reps before you even walk into the gym",
  "Miss a day, lose your streak. That's the whole trick. It works.",
];

export function LandingScreen({ onGetStarted }: Props) {
  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ background: "#0A0A0F" }}
    >
      <div
        className="w-full max-w-[430px] flex flex-col px-6"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 40px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 32px)",
        }}
      >
        {/* Wordmark */}
        <div className="flex flex-col items-center">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, background: "#141420", border: "2px solid #4361EE" }}
          >
            <span style={{ color: "#4361EE", fontSize: 24, fontWeight: 700 }}>SR</span>
          </div>
          <span
            style={{ marginTop: 10, color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}
          >
            SweatReel
          </span>
        </div>

        <h1
          className="text-center"
          style={{ marginTop: 32, fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}
        >
          Your Saved Workouts Are a Graveyard.
        </h1>

        <p
          className="text-center"
          style={{ marginTop: 12, fontSize: 16, color: "#8888AA", lineHeight: 1.5 }}
        >
          SweatReel turns every fitness reel you save into a real plan — AI builds the exercise
          list, you build the streak. Free, no card.
        </p>

        <ul style={{ marginTop: 24 }} className="space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex gap-3 items-start">
              <Check size={18} strokeWidth={3} style={{ color: "#06D6A0", flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: "#fff", fontSize: 15, lineHeight: 1.45 }}>{b}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onGetStarted}
          className="press-scale w-full flex items-center justify-center"
          style={{
            marginTop: 32,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg,#4361EE,#7B2FBE)",
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          Stop Losing Workouts →
        </button>

        <p className="text-center" style={{ marginTop: 12, fontSize: 12, color: "#8888AA" }}>
          Free forever. No credit card.
        </p>
      </div>
    </div>
  );
}
