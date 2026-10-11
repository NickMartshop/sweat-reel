import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { thumbnailCandidates } from "@/lib/fitvault-data";

/**
 * Shows the real workout thumbnail when available, falls back to a lower-res
 * YouTube thumbnail, then to a neutral placeholder (never a random photo).
 */
export function WorkoutThumbnail({
  src,
  sourceUrl,
  alt,
  className = "",
  iconSize = 24,
  lazy = true,
}: {
  src: string | null | undefined;
  sourceUrl?: string | null;
  alt: string;
  className?: string;
  iconSize?: number;
  lazy?: boolean;
}) {
  const candidates = thumbnailCandidates(src, sourceUrl);
  const key = candidates.join("|");
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [key]);
  const current = candidates[idx];

  if (!current) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={"flex items-center justify-center bg-[#252535] text-text-secondary " + className}
      >
        <Dumbbell size={iconSize} aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={current}
      alt={alt}
      loading={lazy ? "lazy" : undefined}
      decoding="async"
      onError={() => setIdx((i) => i + 1)}
      className={"object-cover " + className}
    />
  );
}
