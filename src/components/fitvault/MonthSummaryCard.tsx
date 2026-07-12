import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "@/lib/auth-store";

interface MonthStats {
  workouts: number;
  activeDays: number;
  bestWeek: number;
}

export function MonthSummaryCard() {
  const [stats, setStats] = useState<MonthStats>({
    workouts: 0,
    activeDays: 0,
    bestWeek: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const user = authStore.get().user;
      if (!user) return;
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      try {
        const { data } = await supabase
          .from("completed_workouts")
          .select("completed_at")
          .eq("user_id", user.id)
          .gte("completed_at", start.toISOString())
          .lt("completed_at", end.toISOString());
        if (cancelled || !data) return;

        const workouts = data.length;
        const dayKeys = new Set<string>();
        const timestamps: number[] = [];
        for (const row of data as { completed_at: string }[]) {
          const d = new Date(row.completed_at);
          dayKeys.add(
            `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
          );
          timestamps.push(d.getTime());
        }
        timestamps.sort((a, b) => a - b);

        // Best rolling 7-day window (within the month's data set).
        let bestWeek = 0;
        for (let i = 0; i < timestamps.length; i++) {
          const windowEnd = timestamps[i] + 7 * 86400000;
          let count = 0;
          for (let j = i; j < timestamps.length && timestamps[j] < windowEnd; j++) {
            count++;
          }
          if (count > bestWeek) bestWeek = count;
        }

        setStats({ workouts, activeDays: dayKeys.size, bestWeek });
      } catch {
        // Silent — default zeros.
      }
    }

    load();
    const unsub = authStore.subscribe(load);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return (
    <section
      style={{
        background: "linear-gradient(135deg,#1A0A2E,#0A0A1F)",
        border: "1px solid #4361EE",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        <Stat value={stats.workouts} label="Workouts" />
        <Stat value={stats.activeDays} label="Active days" />
        <Stat value={stats.bestWeek} label="Best week" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#FFFFFF",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 11, color: "#8888AA", marginTop: 6 }}>{label}</p>
    </div>
  );
}
