import type { FitnessGoal } from "@/lib/profile-store";

interface Props {
  onDone: (goal: FitnessGoal | null) => void;
}

const VALUE_PILLS = [
  "📹 Save any video",
  "🤖 AI exercise list",
  "📅 Plan your week",
  "🔥 Build streaks",
];

const CARD_COLORS = [
  "#4361EE",
  "#FF6B35",
  "#06D6A0",
  "#EF476F",
  "#4361EE",
  "#FF6B35",
  "#06D6A0",
  "#EF476F",
];

function setAuthMode(mode: "signup" | "signin") {
  try {
    sessionStorage.setItem("sweatreel_auth_mode", mode);
  } catch {}
}

export function Onboarding({ onDone }: Props) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "#0A0A0F" }}
    >
      {/* Blue radial glow */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: "30%",
          width: 400,
          height: 400,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(67,97,238,0.2) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      <div
        className="relative flex-1 flex flex-col items-center px-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 20vh)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 80,
            height: 80,
            background: "#141420",
            border: "2px solid #4361EE",
          }}
        >
          <span
            style={{ color: "#4361EE", fontSize: 28, fontWeight: 700 }}
          >
            SR
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-center text-white"
          style={{ marginTop: 16, fontSize: 28, fontWeight: 700, lineHeight: 1.15 }}
        >
          Stop losing your workout reels.
          <br />
          Start training smarter.
        </h1>

        {/* Value pills */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {VALUE_PILLS.map((p) => (
            <span
              key={p}
              style={{
                background: "#141420",
                border: "1px solid #252535",
                color: "#8888AA",
                fontSize: 12,
                padding: "6px 12px",
                borderRadius: 50,
              }}
            >
              {p}
            </span>
          ))}
        </div>

        {/* Phone mockup */}
        <div
          className="mt-6"
          style={{
            width: 200,
            height: 360,
            background: "#141420",
            border: "2px solid #252535",
            borderRadius: 28,
            padding: 12,
          }}
        >
          <div
            className="mx-auto rounded-full"
            style={{ width: 40, height: 4, background: "#252535", marginBottom: 10 }}
          />
          <div className="grid grid-cols-2 gap-2">
            {CARD_COLORS.map((c, i) => (
              <div
                key={i}
                style={{
                  height: 70,
                  background: c,
                  opacity: 0.85,
                  borderRadius: 8,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fixed section */}
      <div
        className="relative px-6"
        style={{
          padding: 24,
          paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
        }}
      >
        <button
          onClick={() => {
            setAuthMode("signup");
            onDone(null);
          }}
          className="press-scale w-full flex items-center justify-center"
          style={{
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg,#4361EE,#7B2FBE)",
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          Get Started — It's Free
        </button>

        <p
          className="text-center"
          style={{ marginTop: 14, fontSize: 12, color: "#8888AA" }}
        >
          Already have an account?{" "}
          <button
            onClick={() => {
              setAuthMode("signin");
              onDone(null);
            }}
            className="press-scale"
            style={{ color: "#4361EE", fontWeight: 600 }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
