import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Flame, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";
import { WorkoutCard } from "@/components/fitvault/WorkoutCard";
import { AddWorkoutSheet } from "@/components/fitvault/AddWorkoutSheet";
import { WorkoutDetailSheet } from "@/components/fitvault/WorkoutDetailSheet";
import { TodayWorkoutCard } from "@/components/fitvault/TodayWorkoutCard";
import { ToastHost } from "@/components/fitvault/Toast";
import { AdBanner } from "@/components/fitvault/AdBanner";
import { UpgradeSheet, type UpgradeTrigger } from "@/components/fitvault/UpgradeSheet";
import { greeting, type Workout } from "@/lib/fitvault-data";
import { useWorkouts, workoutsStore } from "@/lib/workouts-store";
import { usePlans } from "@/lib/plans-store";
import { useProfile } from "@/lib/profile-store";
import { getMondayIndex } from "@/lib/fitvault-data";
import { usePremium } from "@/lib/premium-store";
import type { FitnessGoal } from "@/lib/profile-store";

const BANNER_KEY = "sweatreel_banner_dismissed_at";

function goalSubText(goal?: FitnessGoal | null): string {
  switch (goal) {
    case "build":
      return "Ready to get stronger today?";
    case "lose":
      return "Burn it up today! 🔥";
    case "flex":
      return "Time to flow and recover 🧘";
    case "general":
      return "Let's move and feel good 💪";
    default:
      return "Ready to crush it today?";
  }
}

function haptic(p: number | number[] = 50) {
  try {
    navigator.vibrate?.(p);
  } catch {}
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SweatReel — Your Workout Dashboard & Planner" },
      {
        name: "description",
        content:
          "Your workout dashboard — today's plan, saved library and quick stats, organized in one place on SweatReel.",
      },
      { property: "og:title", content: "SweatReel — Your Workout Dashboard & Planner" },
      { property: "og:description", content: "See today's plan, browse your saved workout library, and check your streak at a glance." },
      { property: "og:url", content: "https://sweat-reel.lovable.app/" },
      { name: "twitter:title", content: "SweatReel — Your Workout Dashboard & Planner" },
      { name: "twitter:description", content: "See today's plan, browse your saved workout library, and check your streak at a glance." },
    ],
    links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/" }],
  }),

  component: HomePage,
});

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="flex-1 bg-card border border-border rounded-2xl p-3">
      <p className="text-[11px] text-text-secondary font-medium">{label}</p>
      <p className="text-2xl font-bold text-white mt-1 leading-none">{value}</p>
      <p className="text-[11px] text-text-secondary mt-1">{sub}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border animate-pulse">
      <div className="aspect-video bg-[#1c1c2c]" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 w-3/4 bg-[#252535] rounded" />
        <div className="h-2.5 w-1/2 bg-[#1c1c2c] rounded" />
      </div>
    </div>
  );
}

function HomePage() {
  const { workouts, loading } = useWorkouts();
  const { entries: planEntries } = usePlans();
  const { profile, weeklyCompletedCount } = useProfile();

  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Workout | null>(null);
  const [greet, setGreet] = useState("Welcome 👋");
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    setGreet(greeting());
    setDateLabel(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  // Pull-to-refresh
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    function onStart(e: TouchEvent) {
      if (window.scrollY <= 0) startY.current = e.touches[0].clientY;
      else startY.current = null;
    }
    function onMove(e: TouchEvent) {
      if (startY.current == null || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) setPull(Math.min(120, dy));
    }
    async function onEnd() {
      if (startY.current == null) return;
      startY.current = null;
      if (pull >= 60) {
        setRefreshing(true);
        haptic(30);
        try {
          await workoutsStore.reload();
        } catch {}
        setRefreshing(false);
      }
      setPull(0);
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [pull, refreshing]);

  const todayIdx = getMondayIndex(new Date());
  const todayWorkouts = planEntries
    .filter((e) => e.day_of_week === todayIdx && e.kind === "workout")
    .map((e) => (e.kind === "workout" ? e.workout : null))
    .filter((w): w is NonNullable<typeof w> => !!w);

  const filtered = useMemo(
    () =>
      workouts.filter((w) =>
        w.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, workouts],
  );

  const plannedThisWeek = planEntries.length;
  const streak = profile?.streak_count ?? 0;

  return (
    <AppShell>
      {(pull > 0 || refreshing) && (
        <div
          className="fixed left-0 right-0 top-0 z-40 flex justify-center pointer-events-none"
          style={{
            transform: `translateY(${Math.min(pull, 80)}px)`,
            opacity: Math.min(1, pull / 60 + (refreshing ? 1 : 0)),
            transition: refreshing ? "transform 200ms" : "none",
          }}
        >
          <div className="mt-2 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <Loader2
              size={18}
              className={refreshing ? "text-primary animate-spin" : "text-primary"}
              style={{ transform: refreshing ? undefined : `rotate(${pull * 3}deg)` }}
            />
          </div>
        </div>
      )}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{greet} — Your Workout Dashboard</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">
            {goalSubText(profile?.fitness_goal)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[50px] bg-card border border-border">
          <Flame size={14} className="text-action" />
          <span className="text-[13px] font-semibold text-white">
            {streak} {streak === 1 ? "day" : "days"}
          </span>
        </div>
      </header>

      <div className="flex gap-2 mt-4">
        <StatCard label="Saved" value={workouts.length} sub="workouts" />
        <StatCard label="This Week" value={plannedThisWeek} sub="planned" />
        <StatCard label="Done" value={weeklyCompletedCount} sub="completed" />
      </div>

      <div className="mt-4 relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your workouts..."
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-card border border-border text-[14px] text-white placeholder:text-text-secondary outline-none focus:border-primary"
        />
        {query && (
          <button
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="press-scale absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#252535] text-white flex items-center justify-center"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <section className="mt-5">
        <div className="flex items-end justify-between">
          <h2 className="text-base font-semibold text-white">Today's Plan</h2>
          <span className="text-[12px] text-text-secondary">{dateLabel}</span>
        </div>

        {todayWorkouts.length === 0 ? (
          <button className="press-scale w-full mt-3 rounded-2xl border-[1.5px] border-dashed border-border p-5 flex flex-col items-center text-center">
            <span className="text-3xl">📅</span>
            <p className="mt-2 text-[14px] text-white font-medium">
              No workout planned today
            </p>
            <p className="mt-1 text-[13px] text-primary font-semibold">
              Tap to plan your week →
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            {todayWorkouts.map((w) => (
              <TodayWorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">My Library</h2>
          <span className="text-[11px] font-semibold text-white bg-primary px-2 py-0.5 rounded-[50px]">
            {workouts.length}
          </span>
        </div>

        {loading ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 && query ? (
          <div className="mt-8 text-center text-text-secondary text-[14px]">
            No workouts match "{query}"
          </div>
        ) : filtered.length === 0 ? (
          <EmptyLibrary onAdd={() => setAddOpen(true)} />
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {filtered.map((w) => (
              <WorkoutCard
                key={w.id}
                workout={w}
                onClick={() => setDetail(w)}
              />
            ))}
          </div>
        )}
      </section>

      <button
        aria-label="Add workout"
        onClick={() => {
          haptic(50);
          setAddOpen(true);
        }}
        className="press-scale fixed right-4 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center z-30"
        style={{
          bottom: "calc(72px + env(safe-area-inset-bottom))",
          boxShadow: "0 4px 20px rgba(67,97,238,0.5)",
        }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <AddWorkoutSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <WorkoutDetailSheet workout={detail} onClose={() => setDetail(null)} />
      <ToastHost />
    </AppShell>
  );
}

function EmptyLibrary({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-9 rounded-md bg-[#252535]" />
        <div className="w-2 h-5 rounded-sm bg-[#252535]" />
        <div className="w-14 h-2 rounded-full bg-[#252535]" />
        <div className="w-2 h-5 rounded-sm bg-[#252535]" />
        <div className="w-3 h-9 rounded-md bg-[#252535]" />
      </div>
      <h3 className="mt-5 text-[18px] font-semibold text-white">
        Your library is empty
      </h3>
      <p className="mt-1 text-[14px] text-text-secondary">
        Save workouts from YouTube, Instagram & TikTok
      </p>
      <button
        onClick={onAdd}
        className="press-scale mt-5 w-full h-[52px] rounded-xl bg-primary text-white font-semibold"
      >
        Add First Workout
      </button>
    </div>
  );
}
