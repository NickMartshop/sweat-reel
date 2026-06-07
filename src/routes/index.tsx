import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Flame } from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";
import { WorkoutCard } from "@/components/fitvault/WorkoutCard";
import { AddWorkoutSheet } from "@/components/fitvault/AddWorkoutSheet";
import { ToastHost } from "@/components/fitvault/Toast";
import { greeting, weeklyPlan, getMondayIndex } from "@/lib/fitvault-data";
import { useWorkouts } from "@/lib/workouts-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitVault — Home" },
      { name: "description", content: "Your workouts, organized. Today's plan, library and quick stats." },
    ],
  }),
  component: HomePage,
});

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="flex-1 bg-card border border-border rounded-2xl p-3">
      <p className="text-[11px] text-text-secondary font-medium">{label}</p>
      <p className="text-2xl font-bold text-white mt-1 leading-none">{value}</p>
      <p className="text-[11px] text-text-secondary mt-1">{sub}</p>
    </div>
  );
}

function HomePage() {
  const workouts = useWorkouts();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
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

  const todayIdx = getMondayIndex(new Date());
  const todayPlan = weeklyPlan[todayIdx] ?? [];
  const todayWorkouts = todayPlan
    .map((id) => workouts.find((w) => w.id === id))
    .filter(Boolean) as typeof workouts;

  const filtered = useMemo(
    () =>
      workouts.filter((w) =>
        w.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, workouts],
  );

  const plannedThisWeek = Object.values(weeklyPlan).flat().length;

  return (
    <AppShell>
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{greet}</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">Ready to crush it today?</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[50px] bg-card border border-border">
          <Flame size={14} className="text-action" />
          <span className="text-[13px] font-semibold text-white">0 days</span>
        </div>
      </header>

      {/* Stat cards */}
      <div className="flex gap-2 mt-4">
        <StatCard label="Saved" value={workouts.length} sub="workouts" />
        <StatCard label="This Week" value={plannedThisWeek} sub="planned" />
        <StatCard label="Done" value={0} sub="completed" />
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your workouts..."
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-card border border-border text-[14px] text-white placeholder:text-text-secondary outline-none focus:border-primary"
        />
      </div>

      {/* Today's Plan */}
      <section className="mt-5">
        <div className="flex items-end justify-between">
          <h2 className="text-base font-semibold text-white">Today's Plan</h2>
          <span className="text-[12px] text-text-secondary">{dateLabel}</span>
        </div>

        {todayWorkouts.length === 0 ? (
          <button className="press-scale w-full mt-3 rounded-2xl border-[1.5px] border-dashed border-border p-5 flex flex-col items-center text-center">
            <span className="text-3xl">📅</span>
            <p className="mt-2 text-[14px] text-white font-medium">No workout planned today</p>
            <p className="mt-1 text-[13px] text-primary font-semibold">Tap to plan your week →</p>
          </button>
        ) : (
          <ul className="mt-3 space-y-2">
            {todayWorkouts.map((w) => (
              <li
                key={w.id}
                className="press-scale flex items-center gap-3 p-2 bg-card border border-border rounded-2xl"
              >
                <img
                  src={w.thumbnail_url}
                  alt=""
                  className="w-[60px] h-[60px] rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-white truncate">{w.title}</p>
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    {w.muscle_group} · {w.duration_mins} min
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My Library */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">My Library</h2>
          <span className="text-[11px] font-semibold text-white bg-primary px-2 py-0.5 rounded-[50px]">
            {workouts.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyLibrary onAdd={() => setAddOpen(true)} />
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {filtered.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        )}
      </section>

      {/* FAB */}
      <button
        aria-label="Add workout"
        onClick={() => setAddOpen(true)}
        className="press-scale fixed right-4 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center z-30"
        style={{
          bottom: "calc(72px + env(safe-area-inset-bottom))",
          boxShadow: "0 4px 20px rgba(67,97,238,0.5)",
        }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <AddWorkoutSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <ToastHost />
    </AppShell>
  );
}

function EmptyLibrary({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      {/* CSS dumbbell */}
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-9 rounded-md bg-[#252535]" />
        <div className="w-2 h-5 rounded-sm bg-[#252535]" />
        <div className="w-14 h-2 rounded-full bg-[#252535]" />
        <div className="w-2 h-5 rounded-sm bg-[#252535]" />
        <div className="w-3 h-9 rounded-md bg-[#252535]" />
      </div>
      <h3 className="mt-5 text-[18px] font-semibold text-white">Your library is empty</h3>
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
