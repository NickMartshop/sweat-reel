import { useState } from "react";
import type { Workout } from "@/lib/fitvault-data";
import { muscleColors, difficultyColors } from "@/lib/fitvault-data";
import { ActiveWorkoutMode } from "./ActiveWorkoutMode";

export function TodayWorkoutCard({ workout }: { workout: Workout }) {
  const [active, setActive] = useState(false);
  const exercises = workout.exercises ?? [];

  return (
    <>
      <div
        className="mt-3 rounded-[20px] p-4"
        style={{ background: "#141420", border: "1px solid #252535" }}
      >
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-text-secondary uppercase tracking-wide font-semibold">
              Today
            </p>
            <p className="mt-0.5 text-[18px] font-bold text-white truncate">
              {workout.title}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className="px-2 py-0.5 rounded-[50px] text-[10px] font-semibold text-white"
                style={{ background: muscleColors[workout.muscle_group] }}
              >
                {workout.muscle_group}
              </span>
              <span
                className="px-2 py-0.5 rounded-[50px] text-[10px] font-semibold"
                style={{
                  background: `${difficultyColors[workout.difficulty]}22`,
                  color: difficultyColors[workout.difficulty],
                }}
              >
                {workout.difficulty}
              </span>
              <span className="text-[11px] text-text-secondary">
                ⏱ {workout.duration_mins} min
              </span>
            </div>
          </div>
          <img
            src={workout.thumbnail_url}
            alt=""
            className="w-[100px] h-[75px] rounded-xl object-cover shrink-0"
          />
        </div>

        {exercises.length > 0 && (
          <div className="mt-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-1.5 min-w-max">
              {exercises.map((ex) => (
                <span
                  key={ex.id}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap"
                  style={{ background: "#252535", color: "#8888AA" }}
                >
                  {ex.name} {ex.sets}×{ex.reps}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setActive(true)}
          className="press-scale mt-4 w-full h-12 rounded-xl text-white font-semibold text-[14px]"
          style={{ background: "#FF6B35" }}
        >
          Start Today's Workout 🔥
        </button>
      </div>
      {active && (
        <ActiveWorkoutMode workout={workout} onClose={() => setActive(false)} />
      )}
    </>
  );
}
