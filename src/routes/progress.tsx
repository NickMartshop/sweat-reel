import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/fitvault/AppShell";
import { DAYS, getMondayIndex, weeklyPlan } from "@/lib/fitvault-data";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "FitVault — Progress" },
      { name: "description", content: "Track your workout streak, weekly activity and monthly heatmap." },
    ],
  }),
  component: ProgressPage,
});

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-white mt-2 leading-none">{value}</p>
      {sub && <p className="text-[11px] text-text-secondary mt-1">{sub}</p>}
    </div>
  );
}

function ProgressPage() {
  const today = new Date();
  const todayIdx = getMondayIndex(today);

  const weekCounts = DAYS.map((_, i) => (weeklyPlan[i] ?? []).length);
  const maxCount = Math.max(1, ...weekCounts);

  // Monthly heatmap (placeholder data)
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startCol = (firstDay.getDay() + 6) % 7; // Mon=0
  const cells: ({ day: number; count: number } | null)[] = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    // Deterministic pseudo-random fill
    const count = d > today.getDate() ? 0 : [0, 0, 0, 1, 0, 2, 0, 1, 0][d % 9];
    cells.push({ day: d, count });
  }

  return (
    <AppShell>
      <header className="text-center pt-2">
        <p className="text-5xl">🔥</p>
        <div className="relative inline-block mt-2">
          <div
            className="absolute inset-0 rounded-full -z-0"
            style={{ background: "rgba(255,107,53,0.15)", filter: "blur(40px)" }}
          />
          <p className="relative text-[60px] font-bold text-white leading-none">0</p>
        </div>
        <p className="text-text-secondary mt-2">day streak</p>
        <p className="text-[12px] text-text-secondary mt-1">Best: 0 days</p>
      </header>

      {/* Weekly chart */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-white">This Week</h2>
        <div className="mt-3 bg-card border border-border rounded-2xl p-4">
          <div className="flex items-end justify-between gap-1.5 h-[120px]">
            {weekCounts.map((c, i) => {
              const h = c === 0 ? 6 : (c / maxCount) * 80 + 12;
              const isToday = i === todayIdx;
              const isFuture = i > todayIdx;
              const color = isFuture ? "#252535" : isToday ? "#FF6B35" : "#4361EE";
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

      {/* Monthly heatmap */}
      <section className="mt-6">
        <h2 className="text-base font-semibold text-white">This Month</h2>
        <div className="mt-3 bg-card border border-border rounded-2xl p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <span key={d} className="text-[10px] text-center text-text-secondary">
                {d.slice(0, 1)}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} className="aspect-square" />;
              const bg =
                cell.count === 0
                  ? "#252535"
                  : cell.count === 1
                    ? "rgba(67,97,238,0.4)"
                    : "#4361EE";
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

      {/* Stats grid */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Total Workouts" value={0} sub="all time" />
        <StatCard label="Total Time" value="0h" sub="all time" />
        <StatCard label="Best Muscle" value="—" sub="most worked" />
        <StatCard label="This Month" value={0} sub="workouts" />
      </section>
    </AppShell>
  );
}
