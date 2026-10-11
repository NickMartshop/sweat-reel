import { MoreVertical } from "lucide-react";
import { muscleColors, difficultyColors, formatDuration, type Workout } from "@/lib/fitvault-data";
import { WorkoutThumbnail } from "./WorkoutThumbnail";

export function WorkoutCard({
  workout,
  onMenu,
  onClick,
}: {
  workout: Workout;
  onMenu?: () => void;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="press-scale rounded-2xl overflow-hidden bg-card border border-border cursor-pointer"
    >
      <div className="relative aspect-video bg-[#252535]">
        <WorkoutThumbnail
          src={workout.thumbnail_url}
          sourceUrl={workout.source_url}
          alt={`${workout.title} workout thumbnail`}
          className="w-full h-full"
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
          {formatDuration(workout.duration_mins) && (
            <>
              <span>·</span>
              <span>{formatDuration(workout.duration_mins)}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
