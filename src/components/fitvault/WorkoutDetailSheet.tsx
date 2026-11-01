import { useEffect, useState } from "react";
import { ArrowLeft, MoreVertical, Play, X, Plus, Trash2 } from "lucide-react";
import {
  difficultyColors,
  muscleColors,
  DAYS,
  DAYS_FULL,
  getMondayIndex,
  isValidDuration,
  formatDuration,
  type MuscleGroup,
  type Difficulty,
  type Workout,
  type Exercise,
} from "@/lib/fitvault-data";
import { workoutsStore } from "@/lib/workouts-store";
import { plansStore } from "@/lib/plans-store";
import { toast } from "./Toast";
import { ActiveWorkoutMode } from "./ActiveWorkoutMode";
import { WorkoutThumbnail } from "./WorkoutThumbnail";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Arms",
  "Core",
  "Full Body",
  "Cardio",
];
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function WorkoutDetailSheet({
  workout,
  onClose,
}: {
  workout: Workout | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(!!workout);
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [active, setActive] = useState(false);

  // Add to Plan
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [planDay, setPlanDay] = useState<number>(() => getMondayIndex());
  const [addingToPlan, setAddingToPlan] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editMuscle, setEditMuscle] = useState<MuscleGroup>("Full Body");
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>("Medium");
  const [editDuration, setEditDuration] = useState("");
  const [editExercises, setEditExercises] = useState<
    { id: string; name: string; sets: string; reps: string }[]
  >([]);

  useEffect(() => {
    if (workout) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
        setActive(false);
        setMenuOpen(false);
        setAddPlanOpen(false);
        setEditOpen(false);
        setConfirmDelete(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [workout]);

  if (!mounted || !workout) return null;
  const safeHttpUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const p = new URL(url);
      return p.protocol === "http:" || p.protocol === "https:" ? p.toString() : null;
    } catch {
      return null;
    }
  };

  const shareUrl = safeHttpUrl(workout.source_url);

  const exercises = workout.exercises ?? [];
  const hasExercises = exercises.length > 0;
  const durationLabel = formatDuration(workout.duration_mins);

  const handleShare = async () => {
    setMenuOpen(false);
    try {
      if (navigator.share) {
        await navigator.share({
          title: workout.title,
          url: shareUrl ?? window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl ?? workout.title);
        toast.success("Copied to clipboard");
      }
    } catch {
      /* cancelled */
    }
  };

  const openAddToPlan = () => {
    setMenuOpen(false);
    setPlanDay(getMondayIndex());
    setAddPlanOpen(true);
  };

  const handleAddToPlan = async () => {
    if (addingToPlan) return;
    setAddingToPlan(true);
    try {
      // Await persistence; success toast only after the DB insert resolves.
      await plansStore.add(planDay, workout.id);
      setAddPlanOpen(false);
      toast.success("Added to plan 📅");
    } catch {
      toast.error("Couldn't add to plan. Try again.");
    } finally {
      setAddingToPlan(false);
    }
  };

  const openEdit = () => {
    setMenuOpen(false);
    setEditTitle(workout.title);
    setEditMuscle(workout.muscle_group);
    setEditDifficulty(workout.difficulty);
    setEditDuration(String(workout.duration_mins || ""));
    setEditExercises(
      exercises.length > 0
        ? exercises.map((e) => ({
            id: e.id || uid(),
            name: e.name,
            sets: String(e.sets),
            reps: String(e.reps),
          }))
        : [{ id: uid(), name: "", sets: "3", reps: "10" }],
    );
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (saving) return;
    const title = editTitle.trim();
    if (!title) {
      toast.error("Enter a workout title");
      return;
    }
    const duration = Number(editDuration);
    if (!isValidDuration(duration)) {
      toast.error("Duration must be a whole number of minutes (1–600)");
      return;
    }
    const cleanedExercises: Exercise[] = [];
    for (const row of editExercises) {
      const name = row.name.trim();
      if (!name) continue;
      const sets = Number(row.sets);
      const reps = Number(row.reps);
      if (
        !Number.isInteger(sets) ||
        sets < 1 ||
        sets > 50 ||
        !Number.isInteger(reps) ||
        reps < 1 ||
        reps > 1000
      ) {
        toast.error(`Check sets/reps for "${name}" (sets 1–50, reps 1–1000)`);
        return;
      }
      cleanedExercises.push({ id: row.id, name, sets, reps });
    }
    setSaving(true);
    try {
      // Owner-scoped update; success toast only after the DB confirms.
      await workoutsStore.update(workout.id, {
        title,
        muscle_group: editMuscle,
        difficulty: editDifficulty,
        duration_mins: duration,
        exercises: cleanedExercises,
      });
      setEditOpen(false);
      toast.success("Workout updated");
    } catch {
      toast.error("Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      // Store restores prior UI state and rethrows if the DB delete fails.
      await workoutsStore.remove(workout.id);
      setConfirmDelete(false);
      toast.success("Workout deleted");
      onClose();
    } catch {
      toast.error("Couldn't delete. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  const menuItems: {
    label: string;
    danger?: boolean;
    action: () => void | Promise<void>;
  }[] = [
    { label: "Edit", action: openEdit },
    { label: "Add to Plan", action: openAddToPlan },
    { label: "Share", action: handleShare },
    {
      label: "Delete",
      danger: true,
      action: () => {
        setMenuOpen(false);
        setConfirmDelete(true);
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-40">
      <div className={"absolute inset-0 flex justify-center pointer-events-none"}>
        <div
          className={
            "pointer-events-auto relative w-full max-w-[430px] h-full bg-background flex flex-col transition-transform duration-300 ease-out " +
            (visible ? "translate-x-0" : "translate-x-full")
          }
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* Header */}
          <header
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-14 px-2"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <button
              aria-label="Back"
              onClick={onClose}
              className="press-scale w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative">
              <button
                aria-label="More"
                onClick={() => setMenuOpen((o) => !o)}
                className="press-scale w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
              >
                <MoreVertical size={20} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-44 rounded-xl bg-card border border-border overflow-hidden shadow-lg">
                    {menuItems.map((it) => (
                      <button
                        key={it.label}
                        onClick={it.action}
                        className={
                          "block w-full text-left px-4 py-2.5 text-[14px] " +
                          (it.danger ? "text-[#EF476F]" : "text-white") +
                          " hover:bg-[#1c1c2c]"
                        }
                      >
                        {it.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 140 }}>
            {/* Video section */}
            <div className="relative w-full aspect-video bg-[#252535]">
              <WorkoutThumbnail
                src={workout.thumbnail_url}
                sourceUrl={workout.source_url}
                alt={`${workout.title} workout thumbnail`}
                lazy={false}
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 bg-black/20" />
              <button
                aria-label="Play"
                onClick={() => {
                  if (shareUrl) {
                    window.open(shareUrl, "_blank", "noopener,noreferrer");
                  } else {
                    toast.info(workout.source_url ? "Invalid video link" : "No video source");
                  }
                }}
                className="press-scale absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center"
              >
                <Play size={28} className="text-primary fill-primary ml-1" />
              </button>
              {workout.platform && (
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-[11px] font-semibold text-white">
                  {workout.platform}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="px-4">
              <h1 className="mt-3 text-[22px] font-bold text-white leading-tight">
                {workout.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white"
                  style={{ background: muscleColors[workout.muscle_group] }}
                >
                  {workout.muscle_group}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: difficultyColors[workout.difficulty],
                    color: workout.difficulty === "Medium" ? "#0A0A0F" : "white",
                  }}
                >
                  {workout.difficulty}
                </span>
                {durationLabel && (
                  <span className="px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-white">
                    ⏱ {durationLabel}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={openAddToPlan}
                  className="press-scale flex-1 h-11 rounded-[10px] border border-primary text-primary text-[14px] font-semibold"
                >
                  Add to Plan 📅
                </button>
                <button
                  onClick={handleShare}
                  className="press-scale flex-1 h-11 rounded-[10px] border border-[#8888AA] text-[#8888AA] text-[14px] font-semibold"
                >
                  Share 📤
                </button>
              </div>

              {/* Exercises */}
              <div className="mt-6 flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-white">Exercises</h2>
                <span className="text-[11px] font-semibold text-white bg-[#252535] px-2 py-0.5 rounded-full">
                  {exercises.length}
                </span>
              </div>

              {hasExercises ? (
                <ul className="mt-3 divide-y divide-[#252535]">
                  {exercises.map((e, i) => (
                    <li key={e.id} className="flex items-center gap-3 py-3">
                      <span className="w-7 h-7 rounded-full bg-primary text-white text-[12px] font-semibold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-[15px] font-medium text-white truncate">
                        {e.name}
                      </span>
                      <span className="text-[13px] text-[#8888AA] tabular-nums">
                        {e.sets} × {e.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-center">
                  <p className="text-[14px] text-text-secondary">No exercises listed</p>
                  <button
                    onClick={openEdit}
                    className="mt-3 px-4 h-10 rounded-xl border border-primary text-primary text-[13px] font-semibold press-scale"
                  >
                    Add Exercises
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="absolute left-0 right-0 px-4 pt-3 bg-card border-t border-border"
            style={{ bottom: "calc(64px + env(safe-area-inset-bottom))", paddingBottom: 12 }}
          >
            <button
              onClick={() => setActive(true)}
              className="press-scale w-full h-14 rounded-xl text-white text-[18px] font-bold"
              style={{
                background: "#FF6B35",
                boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
              }}
            >
              {hasExercises ? "Start Workout 🔥" : "Start (No exercises)"}
            </button>
          </div>

          {/* Delete confirm */}
          {confirmDelete && (
            <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-6">
              <div className="w-full max-w-xs rounded-2xl bg-card border border-border p-5 animate-scale-in">
                <h3 className="text-[16px] font-semibold text-white">Delete workout?</h3>
                <p className="mt-1 text-[13px] text-text-secondary">This cannot be undone.</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 h-10 rounded-xl bg-[#252535] text-white text-[14px] font-semibold press-scale"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 h-10 rounded-xl bg-[#EF476F] text-white text-[14px] font-semibold press-scale disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add to Plan dialog */}
          {addPlanOpen && (
            <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-6">
              <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 animate-scale-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-white">Add to this week</h3>
                  <button
                    aria-label="Close"
                    onClick={() => setAddPlanOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#252535] text-white flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Choose a day for “{workout.title}”
                </p>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {DAYS.map((d, i) => (
                    <button
                      key={d}
                      onClick={() => setPlanDay(i)}
                      className={
                        "h-11 rounded-xl text-[11px] font-semibold press-scale " +
                        (planDay === i
                          ? "bg-primary text-white"
                          : "bg-[#252535] text-text-secondary")
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-[13px] text-text-secondary">
                  {DAYS_FULL[planDay]}
                </p>
                <button
                  onClick={handleAddToPlan}
                  disabled={addingToPlan}
                  className="press-scale mt-4 w-full h-11 rounded-xl text-white text-[14px] font-semibold disabled:opacity-60"
                  style={{ background: "#FF6B35" }}
                >
                  {addingToPlan ? "Adding…" : "Add to Plan"}
                </button>
              </div>
            </div>
          )}

          {/* Edit dialog */}
          {editOpen && (
            <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4">
              <div className="w-full max-w-sm max-h-full overflow-y-auto rounded-2xl bg-card border border-border p-5 animate-scale-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-white">Edit workout</h3>
                  <button
                    aria-label="Close"
                    onClick={() => setEditOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#252535] text-white flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>

                <label className="mt-4 block text-[12px] font-semibold text-text-secondary">
                  Title
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={120}
                    className="mt-1 w-full h-11 rounded-xl bg-[#1c1c2c] border border-border px-3 text-[14px] text-white outline-none focus:border-primary"
                    placeholder="Workout title"
                  />
                </label>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="block text-[12px] font-semibold text-text-secondary">
                    Muscle group
                    <select
                      value={editMuscle}
                      onChange={(e) => setEditMuscle(e.target.value as MuscleGroup)}
                      className="mt-1 w-full h-11 rounded-xl bg-[#1c1c2c] border border-border px-2 text-[14px] text-white outline-none focus:border-primary"
                    >
                      {MUSCLE_GROUPS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-[12px] font-semibold text-text-secondary">
                    Difficulty
                    <select
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value as Difficulty)}
                      className="mt-1 w-full h-11 rounded-xl bg-[#1c1c2c] border border-border px-2 text-[14px] text-white outline-none focus:border-primary"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-3 block text-[12px] font-semibold text-text-secondary">
                  Duration (minutes)
                  <input
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    inputMode="numeric"
                    className="mt-1 w-full h-11 rounded-xl bg-[#1c1c2c] border border-border px-3 text-[14px] text-white outline-none focus:border-primary"
                    placeholder="30"
                  />
                </label>

                <div className="mt-4 flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-white">Exercises</h4>
                  <button
                    onClick={() =>
                      setEditExercises((rows) => [
                        ...rows,
                        { id: uid(), name: "", sets: "3", reps: "10" },
                      ])
                    }
                    className="press-scale flex items-center gap-1 h-8 px-3 rounded-lg bg-[#252535] text-white text-[12px] font-semibold"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                <div className="mt-2 space-y-2">
                  {editExercises.map((row, i) => (
                    <div key={row.id} className="rounded-xl bg-[#1c1c2c] border border-border p-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <input
                          value={row.name}
                          onChange={(e) =>
                            setEditExercises((rows) =>
                              rows.map((r) =>
                                r.id === row.id ? { ...r, name: e.target.value } : r,
                              ),
                            )
                          }
                          maxLength={120}
                          className="flex-1 min-w-0 h-9 rounded-lg bg-[#252535] px-2 text-[13px] text-white outline-none focus:border-primary"
                          placeholder="Exercise name"
                        />
                        <button
                          aria-label="Remove exercise"
                          onClick={() =>
                            setEditExercises((rows) => rows.filter((r) => r.id !== row.id))
                          }
                          className="w-8 h-8 rounded-lg bg-[#252535] text-[#EF476F] flex items-center justify-center shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="flex-1 flex items-center gap-1 text-[11px] text-text-secondary">
                          Sets
                          <input
                            value={row.sets}
                            onChange={(e) =>
                              setEditExercises((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, sets: e.target.value } : r,
                                ),
                              )
                            }
                            inputMode="numeric"
                            className="w-full h-8 rounded-lg bg-[#252535] px-2 text-[13px] text-white outline-none focus:border-primary"
                          />
                        </label>
                        <label className="flex-1 flex items-center gap-1 text-[11px] text-text-secondary">
                          Reps
                          <input
                            value={row.reps}
                            onChange={(e) =>
                              setEditExercises((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, reps: e.target.value } : r,
                                ),
                              )
                            }
                            inputMode="numeric"
                            className="w-full h-8 rounded-lg bg-[#252535] px-2 text-[13px] text-white outline-none focus:border-primary"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-[#252535] text-white text-[14px] font-semibold press-scale"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 h-11 rounded-xl text-white text-[14px] font-semibold press-scale disabled:opacity-60"
                    style={{ background: "#FF6B35" }}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active workout overlay */}
          {active && <ActiveWorkoutMode workout={workout} onClose={() => setActive(false)} />}
        </div>
      </div>
    </div>
  );
}
