import { useEffect, useRef, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import type { Workout } from "@/lib/fitvault-data";
import { toast } from "./Toast";
import { profileStore } from "@/lib/profile-store";

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function ActiveWorkoutMode({
  workout,
  onClose,
}: {
  workout: Workout;
  onClose: () => void;
}) {
  const exercises = workout.exercises ?? [];
  const hasExercises = exercises.length > 0;

  const [elapsed, setElapsed] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0); // current set index (0-based)
  const [reps, setReps] = useState(0);
  const [resting, setResting] = useState(false);
  const [rest, setRest] = useState(60);
  const [completed, setCompleted] = useState(false);
  const [setsDone, setSetsDone] = useState(0);
  const [confirmStop, setConfirmStop] = useState(false);

  // elapsed timer
  useEffect(() => {
    if (completed) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [completed]);

  // rest countdown
  useEffect(() => {
    if (!resting) return;
    const t = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          clearInterval(t);
          try {
            navigator.vibrate?.(100);
          } catch {}
          advanceAfterRest();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resting]);

  function advanceAfterRest() {
    setResting(false);
    setReps(0);
    const cur = exercises[exIdx];
    if (!cur) return;
    if (setIdx + 1 < cur.sets) {
      setSetIdx((s) => s + 1);
    } else {
      // next exercise
      if (exIdx + 1 < exercises.length) {
        setExIdx((i) => i + 1);
        setSetIdx(0);
      }
    }
  }

  function completeSet() {
    setSetsDone((n) => n + 1);
    const cur = exercises[exIdx];
    const isLastSet = setIdx + 1 >= cur.sets;
    const isLastEx = exIdx + 1 >= exercises.length;
    if (isLastSet && isLastEx) {
      setCompleted(true);
      return;
    }
    setRest(60);
    setResting(true);
  }

  function gotoPrev() {
    if (exIdx === 0) return;
    setExIdx(exIdx - 1);
    setSetIdx(0);
    setReps(0);
    setResting(false);
  }
  function gotoNext() {
    if (exIdx + 1 >= exercises.length) return;
    setExIdx(exIdx + 1);
    setSetIdx(0);
    setReps(0);
    setResting(false);
  }

  function attemptStop() {
    setConfirmStop(true);
  }

  if (completed) {
    return (
      <CompletionScreen
        workout={workout}
        elapsed={elapsed}
        setsDone={setsDone}
        exercisesDone={hasExercises ? exercises.length : 0}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, #141420 0%, #0A0A0F 70%)",
      }}
    >
      <div
        className="relative w-full max-w-[430px] h-full flex flex-col text-white"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-4">
          <button
            onClick={attemptStop}
            className="press-scale flex items-center gap-1 text-[14px] font-semibold text-[#EF476F]"
          >
            <X size={18} /> Stop
          </button>
          <span className="text-[18px] font-semibold text-text-secondary tabular-nums">
            {fmt(elapsed)}
          </span>
          <span className="text-[12px] text-text-secondary max-w-[110px] truncate">
            {workout.title}
          </span>
        </header>

        {/* Progress bar */}
        <div className="h-1 bg-[#252535]">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: hasExercises
                ? `${((exIdx + 1) / exercises.length) * 100}%`
                : "100%",
            }}
          />
        </div>

        {hasExercises ? (
          <div className="flex-1 flex flex-col px-6 pt-8 pb-6 overflow-y-auto">
            {resting ? (
              <RestTimer
                seconds={rest}
                total={60}
                onSkip={advanceAfterRest}
              />
            ) : (
              <ExerciseView
                key={`${exIdx}-${setIdx}`}
                exIdx={exIdx}
                total={exercises.length}
                name={exercises[exIdx].name}
                setIdx={setIdx}
                sets={exercises[exIdx].sets}
                targetReps={exercises[exIdx].reps}
                reps={reps}
                onReps={setReps}
                onComplete={completeSet}
              />
            )}

            {/* Nav row */}
            {!resting && (
              <div className="mt-auto pt-6 flex items-center justify-between gap-3">
                <button
                  onClick={gotoPrev}
                  disabled={exIdx === 0}
                  className="press-scale h-11 px-4 rounded-xl bg-card border border-border text-[14px] font-medium text-white disabled:opacity-30"
                >
                  ← Prev
                </button>
                {exIdx + 1 >= exercises.length ? (
                  <button
                    onClick={() => setCompleted(true)}
                    className="press-scale h-11 px-4 rounded-xl bg-action text-white text-[14px] font-semibold"
                  >
                    Finish Workout ✓
                  </button>
                ) : (
                  <button
                    onClick={gotoNext}
                    className="press-scale h-11 px-4 rounded-xl bg-card border border-border text-white text-[14px] font-medium"
                  >
                    Next Exercise →
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-text-secondary text-[13px] uppercase tracking-wide">
              In Progress
            </p>
            <h2 className="mt-3 text-[28px] font-bold text-white">
              {workout.title}
            </h2>
            <p className="mt-10 text-[48px] font-bold tabular-nums">
              {fmt(elapsed)}
            </p>
            <button
              onClick={() => setCompleted(true)}
              className="mt-12 w-full h-14 rounded-xl bg-primary text-white text-[16px] font-semibold press-scale"
            >
              Mark as Complete
            </button>
          </div>
        )}

        {confirmStop && (
          <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center p-6">
            <div className="w-full max-w-xs rounded-2xl bg-card border border-border p-5 animate-scale-in">
              <h3 className="text-[16px] font-semibold text-white">
                Stop workout?
              </h3>
              <p className="mt-1 text-[13px] text-text-secondary">
                Your progress won't be saved.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setConfirmStop(false)}
                  className="flex-1 h-10 rounded-xl bg-[#252535] text-white text-[14px] font-semibold press-scale"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmStop(false);
                    onClose();
                  }}
                  className="flex-1 h-10 rounded-xl bg-[#EF476F] text-white text-[14px] font-semibold press-scale"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseView({
  exIdx,
  total,
  name,
  setIdx,
  sets,
  targetReps,
  reps,
  onReps,
  onComplete,
}: {
  exIdx: number;
  total: number;
  name: string;
  setIdx: number;
  sets: number;
  targetReps: number;
  reps: number;
  onReps: (n: number) => void;
  onComplete: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <p className="text-[13px] text-text-secondary">
        Exercise {exIdx + 1} of {total}
      </p>
      <h2 className="mt-2 text-[36px] font-bold leading-tight text-white">
        {name}
      </h2>
      <p className="mt-2 text-[15px] text-text-secondary">
        Set {setIdx + 1} of {sets}
      </p>

      <p className="mt-10 text-[13px] text-text-secondary">
        Reps: {targetReps} target
      </p>
      <div className="mt-3 flex items-center gap-6">
        <button
          onClick={() => onReps(Math.max(0, reps - 1))}
          className="press-scale w-16 h-16 rounded-full bg-card border border-border text-white text-[28px] flex items-center justify-center"
          aria-label="Decrease reps"
        >
          <Minus size={28} />
        </button>
        <span className="w-20 text-[56px] font-bold text-white tabular-nums leading-none">
          {reps}
        </span>
        <button
          onClick={() => onReps(reps + 1)}
          className="press-scale w-16 h-16 rounded-full bg-card border border-border text-white text-[28px] flex items-center justify-center"
          aria-label="Increase reps"
        >
          <Plus size={28} />
        </button>
      </div>

      <button
        onClick={onComplete}
        className="mt-8 w-full h-14 rounded-xl bg-primary text-white text-[16px] font-semibold press-scale"
      >
        Complete Set →
      </button>
    </div>
  );
}

function RestTimer({
  seconds,
  total,
  onSkip,
}: {
  seconds: number;
  total: number;
  onSkip: () => void;
}) {
  const r = 70;
  const C = 2 * Math.PI * r;
  const progress = seconds / total;
  const warn = seconds <= 10;
  const color = warn ? "#FFD166" : "#06D6A0";
  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <p className="text-[14px] text-text-secondary uppercase tracking-widest">
        Rest
      </p>
      <div className="relative mt-6 w-[180px] h-[180px]">
        <svg width="180" height="180" className="-rotate-90">
          <circle cx="90" cy="90" r={r} stroke="#252535" strokeWidth="8" fill="none" />
          <circle
            cx="90"
            cy="90"
            r={r}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[48px] font-bold tabular-nums"
          style={{ color }}
        >
          {seconds}
        </span>
      </div>
      <button
        onClick={onSkip}
        className="mt-8 text-[14px] text-text-secondary press-scale"
      >
        Skip Rest
      </button>
    </div>
  );
}

function CompletionScreen({
  workout,
  elapsed,
  setsDone,
  exercisesDone,
  onClose,
}: {
  workout: Workout;
  elapsed: number;
  setsDone: number;
  exercisesDone: number;
  onClose: () => void;
}) {
  const [logged, setLogged] = useState(false);
  useEffect(() => {
    try {
      navigator.vibrate?.([100, 50, 100]);
    } catch {}
  }, []);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Just completed "${workout.title}" on FitVault! 💪🔥 Check it out: ${shareUrl}`,
  )}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(67,97,238,0.15), #0A0A0F 70%)",
      }}
    >
      {/* Confetti */}
      <Confetti />
      <div
        className="relative w-full max-w-[430px] h-full flex flex-col items-center justify-center text-center px-6"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="text-[64px] leading-none animate-scale-in">🎉</div>
        <h2 className="mt-2 text-[28px] font-bold text-white">
          Workout Complete!
        </h2>
        <p className="mt-1 text-[13px] text-text-secondary truncate max-w-full">
          {workout.title}
        </p>

        <div className="mt-8 w-full grid grid-cols-3 gap-2">
          <Stat icon="⏱" value={fmt(elapsed)} label="Total time" />
          <Stat icon="💪" value={exercisesDone} label="Exercises" />
          <Stat icon="🔥" value={setsDone} label="Sets" />
        </div>

        <div className="mt-8 px-5 py-3 rounded-2xl bg-card border border-border">
          <p className="text-[20px] font-bold text-action">🔥 1 day streak!</p>
        </div>

        <div className="mt-10 w-full">
          <button
            onClick={async () => {
              if (logged) return;
              setLogged(true);
              try {
                await profileStore.logCompleted(
                  workout.id,
                  Math.max(1, Math.round(elapsed / 60)),
                );
                toast.success("Workout logged ✓");
              } catch {
                setLogged(false);
                toast.error("Couldn't log. Try again.");
              }
            }}
            disabled={logged}
            className="w-full h-[52px] rounded-xl bg-primary text-white text-[15px] font-semibold press-scale disabled:opacity-60"
          >
            {logged ? "Logged ✓" : "Log This Workout ✓"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full h-[52px] rounded-xl bg-[#25D366] text-white text-[15px] font-semibold press-scale flex items-center justify-center gap-2"
          >
            Share on WhatsApp
          </a>
          <button
            onClick={onClose}
            className="mt-2 w-full h-[52px] rounded-xl border border-border text-white text-[15px] font-semibold press-scale"
          >
            Back to Library
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <p className="text-[14px]">{icon}</p>
      <p className="mt-1 text-[20px] font-bold text-white tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-text-secondary">{label}</p>
    </div>
  );
}

const CONFETTI_COLORS = ["#4361EE", "#FF6B35", "#06D6A0", "#FFD166"];

function Confetti() {
  // Stable random pieces (mount once)
  const piecesRef = useRef(
    Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 1.2,
      duration: 2.5 + Math.random() * 2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 360,
    })),
  );
  return (
    <>
      <style>{`@keyframes fv-confetti{0%{transform:translateY(110vh) rotate(0)}100%{transform:translateY(-20vh) rotate(720deg)}}`}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {piecesRef.current.map((p) => (
          <span
            key={p.id}
            className="absolute block rounded-sm"
            style={{
              left: `${p.left}%`,
              bottom: 0,
              width: p.size,
              height: p.size * 1.6,
              background: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animation: `fv-confetti ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
