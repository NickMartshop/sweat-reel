import { useEffect, useState } from "react";
import { achievementBus, type Achievement } from "@/lib/achievements";

export function AchievementToastHost() {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    return achievementBus.subscribe((a) => setQueue((q) => [...q, a]));
  }, []);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent(next);
    const t = setTimeout(() => setCurrent(null), 4000);
    return () => clearTimeout(t);
  }, [queue, current]);

  if (!current) return null;
  return (
    <div
      className="fixed inset-x-0 z-[110] flex justify-center px-4 pointer-events-none"
      style={{ bottom: "100px" }}
    >
      <div
        className="pointer-events-auto rounded-2xl px-4 py-3 shadow-xl w-full max-w-[400px] flex items-center gap-3 animate-fade-in"
        style={{ background: "linear-gradient(90deg,#7B2FBE,#4361EE)" }}
      >
        <span className="text-2xl">🏆</span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">
            Achievement Unlocked
          </p>
          <p className="text-[15px] font-bold text-white truncate">
            {current.emoji} {current.title}
          </p>
        </div>
      </div>
    </div>
  );
}
