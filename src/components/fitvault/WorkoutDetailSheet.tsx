import { useEffect, useState } from "react";
import { ArrowLeft, MoreVertical, Play } from "lucide-react";
import {
  difficultyColors,
  muscleColors,
  type Workout,
} from "@/lib/fitvault-data";
import { workoutsStore } from "@/lib/workouts-store";
import { toast } from "./Toast";
import { ActiveWorkoutMode } from "./ActiveWorkoutMode";

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
  const [active, setActive] = useState(false);

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
      }, 300);
      return () => clearTimeout(t);
    }
  }, [workout]);

  if (!mounted || !workout) return null;

  const exercises = workout.exercises ?? [];
  const hasExercises = exercises.length > 0;

  const handleShare = async () => {
    setMenuOpen(false);
    try {
      if (navigator.share) {
        await navigator.share({
          title: workout.title,
          url: workout.source_url ?? window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          workout.source_url ?? workout.title,
        );
        toast.success("Copied to clipboard");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      <div
        className={
          "absolute inset-0 flex justify-center pointer-events-none"
        }
      >
        <div
          className={
            "pointer-events-auto relative w-full max-w-[430px] h-full bg-background flex flex-col transition-transform duration-300 ease-out " +
            (visible ? "translate-x-0" : "translate-x-full")
          }
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* Header */}
          <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-14 px-2"
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
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-20 w-44 rounded-xl bg-card border border-border overflow-hidden shadow-lg">
                    {[
                      { label: "Edit", action: () => toast.info("Edit coming soon") },
                      { label: "Add to Plan", action: () => toast.info("Added to plan 📅") },
                      { label: "Share", action: handleShare },
                      {
                        label: "Delete",
                        danger: true,
                        action: () => {
                          setMenuOpen(false);
                          setConfirmDelete(true);
                        },
                      },
                    ].map((it) => (
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
          <div className="flex-1 overflow-y-auto pb-28">
            {/* Video section */}
            <div className="relative w-full aspect-video bg-[#252535]">
              <img
                src={workout.thumbnail_url}
                alt={workout.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <button
                aria-label="Play"
                onClick={() => {
                  if (workout.source_url) {
                    window.open(workout.source_url, "_blank");
                  } else {
                    toast.info("No video source");
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
                    color:
                      workout.difficulty === "Medium" ? "#0A0A0F" : "white",
                  }}
                >
                  {workout.difficulty}
                </span>
                {workout.duration_mins > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-card border border-border text-[11px] text-white">
                    ⏱ {workout.duration_mins} min
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toast.info("Added to plan 📅")}
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
                <h2 className="text-[16px] font-semibold text-white">
                  Exercises
                </h2>
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
                  <p className="text-[14px] text-text-secondary">
                    No exercises listed
                  </p>
                  <button
                    onClick={() => toast.info("Edit coming soon")}
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
            className="absolute left-0 right-0 bottom-0 px-4 pt-3 bg-card border-t border-border"
            style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
          >
            <button
              onClick={() => setActive(true)}
              className="press-scale w-full h-14 rounded-xl text-white text-[18px] font-bold"
              style={{
                background: "#FF6B35",
                boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
              }}
            >
              {hasExercises
                ? "Start Workout 🔥"
                : "Start (No exercises)"}
            </button>
          </div>

          {/* Delete confirm */}
          {confirmDelete && (
            <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-6">
              <div className="w-full max-w-xs rounded-2xl bg-card border border-border p-5 animate-scale-in">
                <h3 className="text-[16px] font-semibold text-white">
                  Delete workout?
                </h3>
                <p className="mt-1 text-[13px] text-text-secondary">
                  This cannot be undone.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 h-10 rounded-xl bg-[#252535] text-white text-[14px] font-semibold press-scale"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await workoutsStore.remove(workout.id);
                        setConfirmDelete(false);
                        toast.success("Workout deleted");
                        onClose();
                      } catch {
                        toast.error("Couldn't delete. Try again.");
                      }
                    }}
                    className="flex-1 h-10 rounded-xl bg-[#EF476F] text-white text-[14px] font-semibold press-scale"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active workout overlay */}
          {active && (
            <ActiveWorkoutMode
              workout={workout}
              onClose={() => setActive(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
