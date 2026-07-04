import { useEffect, useState } from "react";
import { ACHIEVEMENTS, achievementBus, fetchUnlocked } from "@/lib/achievements";

export function AchievementsGrid() {
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    fetchUnlocked().then(setUnlocked);
    return achievementBus.subscribe(() => {
      fetchUnlocked().then(setUnlocked);
    });
  }, []);

  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-white">Achievements 🏆</h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              className="relative overflow-hidden rounded-2xl p-3 flex flex-col items-center text-center border"
              style={{
                background: isUnlocked ? a.gradient : "#252535",
                borderColor: isUnlocked
                  ? "rgba(255,215,0,0.35)"
                  : "transparent",
                boxShadow: isUnlocked
                  ? "0 0 12px rgba(255,215,0,0.15)"
                  : "none",
                minHeight: 108,
              }}
            >
              {isUnlocked && a.shimmer && (
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
                    animation: "shimmer 2.4s linear infinite",
                    backgroundSize: "200% 100%",
                  }}
                />
              )}
              <span
                className="text-2xl leading-none"
                style={{
                  filter: isUnlocked ? "none" : "grayscale(1) opacity(0.5)",
                }}
              >
                {a.emoji}
              </span>
              <p
                className="mt-1.5 text-[11px] font-bold leading-tight"
                style={{
                  color: isUnlocked
                    ? a.darkText
                      ? "#141420"
                      : "#FFFFFF"
                    : "#555577",
                  filter: isUnlocked ? "none" : "blur(0.3px)",
                }}
              >
                {a.title}
              </p>
              <p
                className="mt-0.5 text-[9px] leading-tight"
                style={{
                  color: isUnlocked
                    ? a.darkText
                      ? "rgba(20,20,32,0.75)"
                      : "rgba(255,255,255,0.85)"
                    : "#3d3d55",
                }}
              >
                {a.description}
              </p>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes shimmer {0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </section>
  );
}
