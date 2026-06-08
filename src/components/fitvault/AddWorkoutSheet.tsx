import { useEffect, useRef, useState } from "react";
import { X, Trash2, ClipboardPaste, Sparkles, Minus, Plus, Play, Check } from "lucide-react";
import { muscleColors, type Difficulty, type MuscleGroup, type Workout } from "@/lib/fitvault-data";
import { workoutsStore } from "@/lib/workouts-store";
import { toast } from "./Toast";

const MUSCLE_GROUPS: { key: MuscleGroup; emoji: string }[] = [
  { key: "Chest", emoji: "🏋️" },
  { key: "Back", emoji: "💪" },
  { key: "Legs", emoji: "🦵" },
  { key: "Arms", emoji: "💪" },
  { key: "Core", emoji: "🔥" },
  { key: "Full Body", emoji: "⚡" },
  { key: "Cardio", emoji: "🏃" },
];

type Platform = "YouTube" | "Instagram" | "TikTok" | null;

function detectPlatform(url: string): Platform {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("instagram.com")) return "Instagram";
  if (u.includes("tiktok.com")) return "TikTok";
  return null;
}

function extractYouTubeId(url: string): string | null {
  const m =
    url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

type Exercise = { id: number; name: string; sets: number; reps: number };

export function AddWorkoutSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  // form state
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [duration, setDuration] = useState(30);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [savedAnim, setSavedAnim] = useState(false);
  const exId = useRef(1);

  const platform = detectPlatform(url);
  const ytId = platform === "YouTube" ? extractYouTubeId(url) : null;
  const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const [thumbBroken, setThumbBroken] = useState(false);

  useEffect(() => {
    setThumbBroken(false);
    if (platform === "YouTube" && ytId && !title) {
      setTitle("YouTube Workout");
    }
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  // animate open/close
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const hasContent =
    url.trim() || title.trim() || muscle || difficulty || exercises.length > 0;
  const canSave = (url.trim().length > 0 || title.trim().length > 0) && !savedAnim;

  function reset() {
    setUrl("");
    setTitle("");
    setMuscle(null);
    setDifficulty(null);
    setDuration(30);
    setExercises([]);
    setConfirmDiscard(false);
    setSavedAnim(false);
  }

  function attemptClose() {
    if (hasContent) {
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  }

  function discard() {
    reset();
    onClose();
  }

  async function pasteFromClipboard() {
    try {
      const txt = await navigator.clipboard.readText();
      if (txt) setUrl(txt.trim());
    } catch {
      toast.error("Clipboard access denied");
    }
  }

  function addExercise() {
    setExercises((arr) => [
      ...arr,
      { id: exId.current++, name: "", sets: 3, reps: 10 },
    ]);
  }

  function aiExtract() {
    setAiLoading(true);
    setTimeout(() => {
      setExercises([
        { id: exId.current++, name: "Push-ups", sets: 3, reps: 12 },
        { id: exId.current++, name: "Squats", sets: 4, reps: 15 },
        { id: exId.current++, name: "Plank (sec)", sets: 3, reps: 30 },
      ]);
      setAiLoading(false);
      toast.info("Exercises extracted ✨");
    }, 1400);
  }

  function save() {
    if (!canSave) return;
    const w: Workout = {
      id: `u-${Date.now()}`,
      title: title.trim() || "Untitled Workout",
      muscle_group: (muscle ?? "Full Body") as MuscleGroup,
      difficulty: (difficulty ?? "Medium") as Difficulty,
      duration_mins: duration,
      thumbnail_url:
        thumbUrl && !thumbBroken
          ? thumbUrl
          : `https://picsum.photos/seed/${Date.now()}/400/225`,
      source_url: url.trim() || undefined,
      platform: platform ?? null,
      exercises: exercises
        .filter((e) => e.name.trim())
        .map((e) => ({ id: String(e.id), name: e.name.trim(), sets: e.sets, reps: e.reps })),
    };
    setSavedAnim(true);
    setTimeout(() => {
      workoutsStore.add(w);
      toast.success("Workout saved! 💪");
      reset();
      onClose();
    }, 700);
  }

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={
          "absolute inset-0 bg-black/60 transition-opacity duration-300 " +
          (visible ? "opacity-100" : "opacity-0")
        }
        onClick={attemptClose}
      />

      {/* Sheet */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div
          className={
            "pointer-events-auto relative w-full max-w-[430px] h-full bg-background flex flex-col transition-transform duration-300 ease-out " +
            (visible ? "translate-y-0" : "translate-y-full")
          }
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-background border-b border-border">
            <button
              aria-label="Close"
              onClick={attemptClose}
              className="press-scale w-9 h-9 -ml-2 flex items-center justify-center text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-[17px] font-semibold text-white">Add Workout</h2>
            <button
              onClick={save}
              disabled={!canSave}
              className={
                "text-[15px] font-semibold press-scale " +
                (canSave ? "text-primary" : "text-text-secondary opacity-50")
              }
            >
              Save
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
            {/* Source */}
            <SectionLabel>Workout Source</SectionLabel>
            <div className="relative mt-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube, Instagram or TikTok URL"
                className="w-full h-14 rounded-xl bg-card border-[1.5px] border-border text-[14px] text-white placeholder:text-text-secondary outline-none focus:border-primary focus:[box-shadow:0_0_0_3px_rgba(67,97,238,0.2)] pl-4 pr-12 transition-all"
              />
              <button
                aria-label="Paste"
                onClick={pasteFromClipboard}
                className="press-scale absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-text-secondary hover:text-white"
              >
                <ClipboardPaste size={18} />
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              {(["🎬 YouTube", "📸 Instagram", "🎵 TikTok"] as const).map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-full bg-card border border-border text-[10px] text-text-secondary"
                >
                  {p}
                </span>
              ))}
            </div>

            {/* Preview */}
            {platform && (
              <div
                className="mt-3 flex gap-3 p-3 rounded-2xl bg-card border border-border animate-fade-in"
              >
                <div className="relative w-20 h-[60px] rounded-xl overflow-hidden bg-[#252535] flex items-center justify-center shrink-0">
                  {thumbUrl && !thumbBroken ? (
                    <img
                      src={thumbUrl}
                      alt=""
                      onError={() => setThumbBroken(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play size={20} className="text-text-secondary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-white leading-snug line-clamp-2">
                    {title || `${platform} video`}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#252535] text-[10px] font-semibold text-white">
                    {platform}
                  </span>
                </div>
              </div>
            )}

            {/* Details */}
            <SectionLabel className="mt-6">Details</SectionLabel>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="mt-2 w-full h-14 rounded-xl bg-card border-[1.5px] border-border text-[14px] text-white placeholder:text-text-secondary outline-none focus:border-primary focus:[box-shadow:0_0_0_3px_rgba(67,97,238,0.2)] px-4 transition-all"
            />

            <p className="mt-4 text-[13px] font-semibold text-text-secondary">
              Muscle Group
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {MUSCLE_GROUPS.map((m) => {
                const selected = muscle === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setMuscle(m.key)}
                    className={
                      "shrink-0 px-3.5 h-9 rounded-full text-[13px] font-medium border transition-all " +
                      (selected
                        ? "text-white scale-105 border-transparent"
                        : "bg-card border-border text-text-secondary")
                    }
                    style={selected ? { background: muscleColors[m.key] } : undefined}
                  >
                    {m.emoji} {m.key}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[13px] font-semibold text-text-secondary">
              Difficulty
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["Easy", "Medium", "Hard"] as const).map((d) => {
                const selected = difficulty === d;
                const colors: Record<Difficulty, { bg: string; text: string }> = {
                  Easy: { bg: "#06D6A0", text: "white" },
                  Medium: { bg: "#FFD166", text: "#0A0A0F" },
                  Hard: { bg: "#EF476F", text: "white" },
                };
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={
                      "h-11 rounded-xl text-[14px] font-semibold border transition-all " +
                      (selected
                        ? "border-transparent"
                        : "bg-card border-border text-text-secondary")
                    }
                    style={
                      selected
                        ? { background: colors[d].bg, color: colors[d].text }
                        : undefined
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[13px] font-semibold text-text-secondary">
              Duration (optional)
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center w-[140px] h-11 rounded-xl bg-card border border-border overflow-hidden">
                <button
                  onClick={() => setDuration((d) => Math.max(0, d - 5))}
                  className="press-scale h-full w-10 flex items-center justify-center text-text-secondary"
                  aria-label="Decrease"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) =>
                    setDuration(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="flex-1 min-w-0 bg-transparent text-center text-white text-[14px] font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setDuration((d) => d + 5)}
                  className="press-scale h-full w-10 flex items-center justify-center text-text-secondary"
                  aria-label="Increase"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-[13px] text-text-secondary">min</span>
            </div>

            {/* Exercises */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">
                Exercises
              </p>
              <button
                onClick={aiExtract}
                disabled={aiLoading}
                className="text-[13px] font-semibold text-primary press-scale flex items-center gap-1 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    AI Extract <Sparkles size={14} />
                  </>
                )}
              </button>
            </div>

            <ul className="mt-2 space-y-2">
              {exercises.map((ex, idx) => (
                <li
                  key={ex.id}
                  className="flex items-center gap-2 p-2 bg-card border border-border rounded-xl"
                >
                  <span className="w-6 h-6 rounded-full bg-[#252535] text-[11px] font-semibold text-white flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    value={ex.name}
                    onChange={(e) =>
                      setExercises((arr) =>
                        arr.map((x) =>
                          x.id === ex.id ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Exercise"
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-text-secondary outline-none"
                  />
                  <span className="text-text-secondary text-[12px]">×</span>
                  <input
                    type="number"
                    value={ex.sets}
                    onChange={(e) =>
                      setExercises((arr) =>
                        arr.map((x) =>
                          x.id === ex.id ? { ...x, sets: Number(e.target.value) || 0 } : x,
                        ),
                      )
                    }
                    className="w-9 bg-[#252535] rounded text-center text-[12px] text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[11px] text-text-secondary">sets</span>
                  <input
                    type="number"
                    value={ex.reps}
                    onChange={(e) =>
                      setExercises((arr) =>
                        arr.map((x) =>
                          x.id === ex.id ? { ...x, reps: Number(e.target.value) || 0 } : x,
                        ),
                      )
                    }
                    className="w-9 bg-[#252535] rounded text-center text-[12px] text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[11px] text-text-secondary">reps</span>
                  <button
                    aria-label="Delete"
                    onClick={() =>
                      setExercises((arr) => arr.filter((x) => x.id !== ex.id))
                    }
                    className="press-scale w-7 h-7 flex items-center justify-center text-text-secondary"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={addExercise}
              className="mt-2 text-[13px] text-text-secondary press-scale"
            >
              + Add exercise manually
            </button>
          </div>

          {/* Bottom save bar */}
          <div
            className="absolute left-0 right-0 bottom-0 px-4 pt-3 bg-background border-t border-border"
            style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
          >
            <button
              onClick={save}
              disabled={!canSave}
              className={
                "relative w-full h-14 rounded-xl text-[16px] font-semibold press-scale overflow-hidden transition-colors " +
                (canSave
                  ? "bg-primary text-white"
                  : "bg-[#252535] text-text-secondary")
              }
            >
              {savedAnim ? (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#06D6A0] animate-scale-in">
                  <Check size={20} className="text-white" />
                </span>
              ) : (
                "Save to My Library 💪"
              )}
            </button>
          </div>

          {/* Discard confirm */}
          {confirmDiscard && (
            <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center p-6">
              <div className="w-full max-w-xs rounded-2xl bg-card border border-border p-5 animate-scale-in">
                <h3 className="text-[16px] font-semibold text-white">Discard workout?</h3>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Your changes will be lost.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setConfirmDiscard(false)}
                    className="flex-1 h-10 rounded-xl bg-[#252535] text-white text-[14px] font-semibold press-scale"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={discard}
                    className="flex-1 h-10 rounded-xl bg-[#EF476F] text-white text-[14px] font-semibold press-scale"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={
        "text-[13px] font-semibold text-text-secondary uppercase tracking-wide " +
        className
      }
    >
      {children}
    </p>
  );
}
