import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, X, Share2, Loader2, Coffee } from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";
import { ToastHost, toast } from "@/components/fitvault/Toast";
import {
  REST_TYPE_META,
  RestDayTypeSheet,
} from "@/components/fitvault/RestDayTypeSheet";
import type { RestType } from "@/lib/plans-store";
import {
  DAYS,
  DAYS_FULL,
  getMondayIndex,
  muscleColors,
} from "@/lib/fitvault-data";
import { usePlans, plansStore } from "@/lib/plans-store";
import { useWorkouts } from "@/lib/workouts-store";
import { useProfile } from "@/lib/profile-store";
import { usePremium } from "@/lib/premium-store";
import { UpgradeSheet } from "@/components/fitvault/UpgradeSheet";
import { renderWeekCard, shareCanvas } from "@/lib/share-card";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "SweatReel — Plans" },
      {
        name: "description",
        content:
          "Build and review your weekly workout routine to stay on track with your fitness goals on SweatReel.",
      },
      { property: "og:title", content: "My Workout Plans — SweatReel" },
      {
        property: "og:description",
        content:
          "Plan your week, schedule workouts by day, and keep your training organized.",
      },
      { property: "og:url", content: "https://sweat-reel.lovable.app/plans" },
      { name: "twitter:title", content: "My Workout Plans — SweatReel" },
      {
        name: "twitter:description",
        content:
          "Plan your week, schedule workouts by day, and keep your training organized.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/plans" }],
  }),

  component: PlansPage,
});

function PlansPage() {
  const today = new Date();
  const todayIdx = getMondayIndex(today);
  const [selected, setSelected] = useState(todayIdx);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { entries, loading } = usePlans();
  const { workouts } = useWorkouts();
  const { profile } = useProfile();
  const { isPremium } = usePremium();
  const isLocked = !isPremium && selected > 2;

  const monday = new Date(today);
  monday.setDate(today.getDate() - todayIdx);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayHasPlan = useMemo(() => {
    const s = new Set<number>();
    entries.forEach((e) => s.add(e.day_of_week));
    return s;
  }, [entries]);

  const dayEntries = entries.filter((e) => e.day_of_week === selected);
  const workoutEntries = dayEntries.filter((e) => e.kind === "workout");
  const restEntry = dayEntries.find((e) => e.kind === "rest");

  async function handleRemove(id: string) {
    try {
      await plansStore.remove(id);
      toast.show("Removed from plan", "info");
    } catch {
      toast.show("Couldn't remove. Try again.", "error");
    }
  }

  async function handleAddToPlan(workoutId: string) {
    try {
      await plansStore.add(selected, workoutId);
      setPickerOpen(false);
      toast.show("Added to plan 📅", "success");
    } catch {
      toast.show("Couldn't add. Try again.", "error");
    }
  }

  async function handleSelectRest(type: RestType) {
    try {
      await plansStore.addRest(selected, type);
      setRestOpen(false);
      toast.show("Rest day set 🧘", "success");
    } catch {
      toast.show("Couldn't set rest day. Try again.", "error");
    }
  }

  async function handleShareWeek() {
    if (sharing) return;
    setSharing(true);
    try {
      const days = Array.from({ length: 7 }, (_, i) => {
        const entry = entries.find((e) => e.day_of_week === i);
        if (!entry) return { dayIndex: i, title: null, muscle: null };
        if (entry.kind === "workout") {
          return {
            dayIndex: i,
            title: entry.workout.title,
            muscle: entry.workout.muscle_group,
          };
        }
        return {
          dayIndex: i,
          title: `Rest — ${REST_TYPE_META[entry.rest_type].label}`,
          muscle: null,
        };
      });
      const [canvas] = await Promise.all([
        Promise.resolve(
          renderWeekCard({
            name: profile?.name || "My",
            streak: profile?.streak_count ?? 0,
            days,
          }),
        ),
        new Promise((r) => setTimeout(r, 1000)),
      ]);
      await shareCanvas(canvas, "SweatReel-MyWeek.png");
    } catch {
      toast.show("Couldn't create card. Try again.", "error");
    } finally {
      setSharing(false);
    }
  }

  return (
    <AppShell>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">My Week</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Build your weekly routine
          </p>
        </div>
        <button
          onClick={handleShareWeek}
          disabled={sharing}
          className="press-scale h-9 px-3 rounded-xl bg-primary text-white text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-70"
        >
          {sharing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Creating your card... ✨
            </>
          ) : (
            <>
              <Share2 size={14} />
              Share My Week
            </>
          )}
        </button>
      </header>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {DAYS.map((d, i) => {
          const date = weekDates[i];
          const isToday = i === todayIdx;
          const isSel = i === selected;
          const hasPlan = dayHasPlan.has(i);
          const isRest = entries.some(
            (e) => e.day_of_week === i && e.kind === "rest",
          );
          return (
            <button
              key={d}
              onClick={() => setSelected(i)}
              className="press-scale h-14 rounded-xl flex flex-col items-center justify-center gap-0.5"
              style={{
                background: isSel ? "#4361EE" : "#141420",
                border: `1px solid ${isSel ? "#4361EE" : "#252535"}`,
                color: isSel ? "#fff" : "#8888AA",
              }}
            >
              <span className="text-[10px] font-semibold tracking-wide">
                {d}
              </span>
              <span
                className="text-[14px] font-bold"
                style={{
                  color: isSel ? "#fff" : isToday ? "#4361EE" : "#fff",
                }}
              >
                {date.getDate()}
              </span>
              {!isPremium && i > 2 ? (
                <span className="text-[10px] leading-none">🔒</span>
              ) : isRest ? (
                <span className="text-[10px] leading-none">💤</span>
              ) : (
                <span
                  className="w-1 h-1 rounded-full -mt-0.5"
                  style={{
                    background: hasPlan
                      ? "#06D6A0"
                      : isSel
                        ? "rgba(255,255,255,0.4)"
                        : "#252535",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {DAYS_FULL[selected]}
            </h2>
            <p className="text-[12px] text-text-secondary mt-0.5">
              {weekDates[selected].toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 bg-card border border-border rounded-2xl animate-pulse"
              >
                <div className="w-[60px] h-[60px] rounded-xl bg-[#1c1c2c]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 bg-[#252535] rounded" />
                  <div className="h-2.5 w-1/3 bg-[#1c1c2c] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : dayEntries.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-card border border-border p-8 text-center">
            <p className="text-4xl">📅</p>
            <p className="mt-2 text-white font-semibold">
              Nothing planned for {DAYS_FULL[selected]}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setPickerOpen(true)}
                className="press-scale inline-flex items-center justify-center gap-1 px-4 h-10 rounded-xl bg-primary text-white text-[13px] font-semibold"
              >
                Add a workout +
              </button>
              <button
                onClick={() => setRestOpen(true)}
                className="press-scale inline-flex items-center justify-center gap-1 px-4 h-10 rounded-xl border border-border text-white text-[13px] font-semibold"
              >
                <Coffee size={14} /> Mark as Rest Day
              </button>
            </div>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {restEntry && restEntry.kind === "rest" && (
              <li className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl">
                <span className="text-2xl">
                  {REST_TYPE_META[restEntry.rest_type].emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-white">
                    Rest Day — {REST_TYPE_META[restEntry.rest_type].label}
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {REST_TYPE_META[restEntry.rest_type].sub}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(restEntry.id)}
                  className="press-scale w-9 h-9 flex items-center justify-center text-text-secondary"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            )}
            {restEntry &&
              restEntry.kind === "rest" &&
              restEntry.rest_type === "active" && (
                <li className="rounded-2xl border border-primary/40 bg-primary/10 p-3 text-[12px] text-white/90 leading-relaxed">
                  💡 Try 20 min of light walking or foam rolling to help your
                  muscles recover faster.
                </li>
              )}
            {workoutEntries.map(
              (e) =>
                e.kind === "workout" && (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 p-2 bg-card border border-border rounded-2xl"
                  >
                    <img
                      src={e.workout.thumbnail_url}
                      alt=""
                      className="w-[60px] h-[60px] rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-white truncate">
                        {e.workout.title}
                      </p>
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded-[50px] text-[10px] font-semibold text-white"
                        style={{
                          background:
                            muscleColors[
                              e.workout
                                .muscle_group as keyof typeof muscleColors
                            ] ?? "#4361EE",
                        }}
                      >
                        {e.workout.muscle_group}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemove(e.id)}
                      className="press-scale w-9 h-9 flex items-center justify-center text-text-secondary"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ),
            )}
          </ul>
        )}

        {!restEntry && (
          <button
            onClick={() => setPickerOpen(true)}
            className="press-scale mt-4 w-full h-12 rounded-xl border-[1.5px] border-dashed border-primary text-primary font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add workout to {DAYS_FULL[selected]}
          </button>
        )}
        {!restEntry && workoutEntries.length === 0 && dayEntries.length > 0 && (
          <button
            onClick={() => setRestOpen(true)}
            className="press-scale mt-2 w-full h-11 rounded-xl border border-border text-white text-[13px] font-semibold flex items-center justify-center gap-2"
          >
            <Coffee size={14} /> Mark as Rest Day
          </button>
        )}
        {workoutEntries.length > 0 && !restEntry && (
          <button
            onClick={() => setRestOpen(true)}
            className="press-scale mt-2 w-full h-10 rounded-xl border border-border text-text-secondary text-[12px] font-semibold flex items-center justify-center gap-2"
          >
            <Coffee size={14} /> Add rest day note
          </button>
        )}
      </section>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="w-full max-w-[430px] bg-background rounded-t-3xl border-t border-border max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <h3 className="text-[16px] font-semibold text-white">
                Pick a workout
              </h3>
              <button
                onClick={() => setPickerOpen(false)}
                className="press-scale w-9 h-9 -mr-2 text-white"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
            <div className="overflow-y-auto p-3">
              {workouts.length === 0 ? (
                <p className="text-center text-text-secondary py-8 text-[14px]">
                  Save a workout first to plan it.
                </p>
              ) : (
                <ul className="space-y-2">
                  {workouts.map((w) => (
                    <li
                      key={w.id}
                      onClick={() => handleAddToPlan(w.id)}
                      className="press-scale cursor-pointer flex items-center gap-3 p-2 bg-card border border-border rounded-2xl"
                    >
                      <img
                        src={w.thumbnail_url}
                        alt=""
                        className="w-[52px] h-[52px] rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-white truncate">
                          {w.title}
                        </p>
                        <p className="text-[12px] text-text-secondary">
                          {w.muscle_group} · {w.duration_mins} min
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <RestDayTypeSheet
        open={restOpen}
        onClose={() => setRestOpen(false)}
        onSelect={handleSelectRest}
      />
      <ToastHost />
    </AppShell>
  );
}
