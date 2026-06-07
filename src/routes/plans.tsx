import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";
import {
  DAYS,
  DAYS_FULL,
  getMondayIndex,
  mockWorkouts,
  muscleColors,
  weeklyPlan,
} from "@/lib/fitvault-data";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "FitVault — Plans" },
      { name: "description", content: "Build and review your weekly workout routine." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const today = new Date();
  const todayIdx = getMondayIndex(today);
  const [selected, setSelected] = useState(todayIdx);
  const [restDays, setRestDays] = useState<Record<number, boolean>>({ 1: true, 5: true });

  const monday = new Date(today);
  monday.setDate(today.getDate() - todayIdx);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const planIds = weeklyPlan[selected] ?? [];
  const workouts = planIds
    .map((id) => mockWorkouts.find((w) => w.id === id))
    .filter(Boolean) as typeof mockWorkouts;

  const isRest = restDays[selected] || workouts.length === 0 && (selected === 1 || selected === 5);

  return (
    <AppShell>
      <header>
        <h1 className="text-xl font-bold text-white">My Week</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">Build your weekly routine</p>
      </header>

      {/* Day selector */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {DAYS.map((d, i) => {
          const date = weekDates[i];
          const isToday = i === todayIdx;
          const isSel = i === selected;
          const hasPlan = (weeklyPlan[i] ?? []).length > 0;
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
              <span className="text-[10px] font-semibold tracking-wide">{d}</span>
              <span
                className="text-[14px] font-bold"
                style={{ color: isSel ? "#fff" : isToday ? "#4361EE" : "#fff" }}
              >
                {date.getDate()}
              </span>
              <span
                className="w-1 h-1 rounded-full -mt-0.5"
                style={{ background: hasPlan ? "#06D6A0" : isSel ? "rgba(255,255,255,0.4)" : "#252535" }}
              />
            </button>
          );
        })}
      </div>

      {/* Selected day */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{DAYS_FULL[selected]}</h2>
            <p className="text-[12px] text-text-secondary mt-0.5">
              {weekDates[selected].toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-[12px] text-text-secondary">Rest Day</span>
            <Toggle
              checked={!!restDays[selected]}
              onChange={(v) => setRestDays((r) => ({ ...r, [selected]: v }))}
            />
          </label>
        </div>

        {isRest && workouts.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-card border border-border p-8 text-center">
            <p className="text-4xl">😴</p>
            <p className="mt-2 text-white font-semibold">Rest Day</p>
            <p className="text-[13px] text-text-secondary mt-1">Recovery is part of the work.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {workouts.map((w) => (
              <li
                key={w.id}
                className="press-scale flex items-center gap-3 p-2 bg-card border border-border rounded-2xl"
              >
                <img src={w.thumbnail_url} alt="" className="w-[60px] h-[60px] rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-white truncate">{w.title}</p>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-[50px] text-[10px] font-semibold text-white"
                    style={{ background: muscleColors[w.muscle_group] }}
                  >
                    {w.muscle_group}
                  </span>
                </div>
                <GripVertical size={18} className="text-text-secondary" />
              </li>
            ))}
          </ul>
        )}

        <button className="press-scale mt-4 w-full h-12 rounded-xl border-[1.5px] border-dashed border-primary text-primary font-semibold flex items-center justify-center gap-2">
          <Plus size={18} />
          Add workout to {DAYS_FULL[selected]}
        </button>
      </section>
    </AppShell>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-11 h-6 rounded-full relative transition-colors"
      style={{ background: checked ? "#06D6A0" : "#252535" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ left: checked ? "22px" : "2px" }}
      />
    </button>
  );
}
