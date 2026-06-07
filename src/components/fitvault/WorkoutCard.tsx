import { MoreVertical } from "lucide-react";
import { muscleColors, difficultyColors, type Workout } from "@/lib/fitvault-data";

export function WorkoutCard({ workout, onMenu }: { workout: Workout; onMenu?: () => void }) {
  return (
    <article className="press-scale rounded-2xl overflow-hidden bg-card border border-border">
      <div className="relative aspect-video bg-[#252535]">
        <img
          src={workout.thumbnail_url}
          alt={workout.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 40%, #141420)" }}
        />
        <span
          className="absolute bottom-2 left-2 px-2.5 py-1 rounded-[50px] text-[10px] font-semibold text-white"
          style={{ background: muscleColors[workout.muscle_group] }}
        >
          {workout.muscle_group}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenu?.();
          }}
          aria-label="Workout options"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
        >
          <MoreVertical size={16} />
        </button>
      </div>
      <div className="p-2.5">
        <h3 className="text-[13px] font-semibold text-white leading-snug line-clamp-2">
          {workout.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: difficultyColors[workout.difficulty] }}
          />
          <span>{workout.difficulty}</span>
          <span>·</span>
          <span>{workout.duration_mins} min</span>
        </div>
      </div>
    </article>
  );
}
