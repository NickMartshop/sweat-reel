import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";
import { AchievementsGrid } from "@/components/fitvault/AchievementsGrid";
import { toast } from "@/components/fitvault/Toast";
import { DAYS, getMondayIndex } from "@/lib/fitvault-data";
import { usePlans } from "@/lib/plans-store";
import { useProfile } from "@/lib/profile-store";
import { renderStreakCard, shareCanvas } from "@/lib/share-card";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "SweatReel — Progress" },
      {
        name: "description",
        content:
          "Track your workout streak, weekly activity and monthly heatmap so you can see your fitness progress on SweatReel.",
      },
      { property: "og:title", content: "My Progress — SweatReel" },
      { property: "og:description", content: "Visualize your streak, weekly workouts and monthly heatmap to keep momentum going." },
      { property: "og:url", content: "https://sweat-reel.lovable.app/progress" },
      { name: "twitter:title", content: "My Progress — SweatReel" },
      { name: "twitter:description", content: "Visualize your streak, weekly workouts and monthly heatmap to keep momentum going." },
    ],
    links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/progress" }],
  }),

  component: ProgressPage,
});

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-white mt-2 leading-none">{value}</p>
      {sub && <p className="text-[11px] text-text-secondary mt-1">{sub}</p>}
    </div>
  );
}

function ProgressPage() {
  const today = new Date();
  const todayIdx = getMondayIndex(today);
  const { entries } = usePlans();
  const { profile, weeklyCompletedCount } = useProfile();
  const [sharing, setSharing] = useState(false);

  const weekCounts = DAYS.map(
    (_, i) => entries.filter((e) => e.day_of_week === i).length,
  );
  const maxCount = Math.max(1, ...weekCounts);

  const streak = profile?.streak_count ?? 0;
  const best = profile?.best_streak ?? 0;
  const total = profile?.total_workouts ?? 0;

  // Heatmap placeholder
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startCol = (firstDay.getDay() + 6) % 7;
  const cells: ({ day: number; count: number } | null)[] = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, count: 0 });
  }

  async function handleShareStreak() {
    if (sharing) return;
    setSharing(true);
    try {
      const [canvas] = await Promise.all([
        Promise.resolve(renderStreakCard({ streak })),
        new Promise((r) => setTimeout(r, 1000)),
      ]);
      await shareCanvas(canvas, "SweatReel-Streak.png");
    } catch {
      toast.show("Couldn't create card. Try again.", "error");
    } finally {
      setSharing(false);
    }
  }

  return (
    <AppShell>
      <header className="text-center pt-2">
        <h1 className="sr-only">My Progress</h1>

        <p className="text-5xl">🔥</p>
        <div className="relative inline-block mt-2">
          <div
            className="absolute inset-0 rounded-full -z-0"
            style={{
              background: "rgba(255,107,53,0.15)",
              filter: "blur(40px)",
            }}
          />
          <p className="relative text-[60px] font-bold text-white leading-none">
            {streak}
          </p>
        </div>
        <p className="text-text-secondary mt-2">day streak</p>
        <p className="text-[12px] text-text-secondary mt-1">Best: {best} days</p>
        <button
          onClick={handleShareStreak}
          disabled={sharing}
          className="press-scale mt-3 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-white text-[12px] font-semibold disabled:opacity-70"
          style={{ background: "#FF6B35" }}
        >
          {sharing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Creating your card... ✨
            </>
          ) : (
            <>
              <Share2 size={14} />
              Share Streak 🔥
            </>
          )}
        </button>
      </header>


      <section className="mt-8">
        <h2 className="text-base font-semibold text-white">This Week (planned)</h2>
        <div className="mt-3 bg-card border border-border rounded-2xl p-4">
          <div className="flex items-end justify-between gap-1.5 h-[120px]">
            {weekCounts.map((c, i) => {
              const h = c === 0 ? 6 : (c / maxCount) * 80 + 12;
              const isToday = i === todayIdx;
              const isFuture = i > todayIdx;
              const color = isFuture
                ? "#252535"
                : isToday
                  ? "#FF6B35"
                  : "#4361EE";
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-text-secondary">{c}</span>
                  <div
                    className="w-full rounded-md transition-all"
                    style={{ height: `${h}px`, background: color }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: isToday ? "#FF6B35" : "#8888AA" }}
                  >
                    {DAYS[i].slice(0, 1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-white">This Month</h2>
        <div className="mt-3 bg-card border border-border rounded-2xl p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <span
                key={d}
                className="text-[10px] text-center text-text-secondary"
              >
                {d.slice(0, 1)}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} className="aspect-square" />;
              const bg = cell.count === 0 ? "#252535" : "#4361EE";
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md flex items-center justify-center text-[9px] text-white/70 font-medium"
                  style={{ background: bg }}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Total Workouts" value={total} sub="all time" />
        <StatCard label="This Week" value={weeklyCompletedCount} sub="completed" />
        <StatCard label="Current Streak" value={streak} sub="days" />
        <StatCard label="Best Streak" value={best} sub="days" />
      </section>
    </AppShell>
  );
}
