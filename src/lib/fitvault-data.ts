export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Arms"
  | "Core"
  | "Full Body"
  | "Cardio";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

export type Platform = "YouTube" | "Instagram" | "TikTok" | null;

export interface Workout {
  id: string;
  title: string;
  muscle_group: MuscleGroup;
  difficulty: Difficulty;
  duration_mins: number;
  thumbnail_url: string | null;
  source_url?: string;
  platform?: Platform;
  exercises?: Exercise[];
}

export function detectPlatform(url: string): Platform {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("instagram.com")) return "Instagram";
  if (u.includes("tiktok.com")) return "TikTok";
  return null;
}

export const muscleColors: Record<MuscleGroup, string> = {
  Chest: "#4361EE",
  Back: "#7B2FBE",
  Legs: "#FF6B35",
  Arms: "#06D6A0",
  Core: "#EF476F",
  "Full Body": "#4CAF50",
  Cardio: "#FFD166",
};

export const difficultyColors: Record<Difficulty, string> = {
  Easy: "#06D6A0",
  Medium: "#FFD166",
  Hard: "#EF476F",
};

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning 💪";
  if (h < 18) return "Good Afternoon ⚡";
  return "Good Evening 🌙";
}

export const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function getMondayIndex(d = new Date()): number {
  // 0 = Monday ... 6 = Sunday
  return (d.getDay() + 6) % 7;
}

export function getCurrentMonday(d = new Date()): string {
  const idx = getMondayIndex(d);
  const monday = new Date(d);
  monday.setDate(d.getDate() - idx);
  // YYYY-MM-DD
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Map a DB row -> Workout
export function rowToWorkout(row: any): Workout {
  return {
    id: row.id,
    title: row.title,
    muscle_group: (row.muscle_group ?? "Full Body") as MuscleGroup,
    difficulty: (row.difficulty ?? "Medium") as Difficulty,
    duration_mins: row.duration_mins ?? 0,
    // Never substitute an unrelated stock photo; null renders a neutral placeholder.
    thumbnail_url:
      typeof row.thumbnail_url === "string" && row.thumbnail_url.trim()
        ? row.thumbnail_url
        : null,
    source_url: row.url ?? undefined,
    platform: (row.platform ?? null) as Platform,
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
  };
}

export const MIN_DURATION_MINS = 1;
export const MAX_DURATION_MINS = 600;

/** A supported workout duration: integer minutes within 1–600. */
export function isValidDuration(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_DURATION_MINS &&
    value <= MAX_DURATION_MINS
  );
}

/** "30 min" for valid durations, null otherwise (hide absurd values). */
export function formatDuration(value: unknown): string | null {
  return isValidDuration(value) ? `${value} min` : null;
}

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

/**
 * Ordered list of thumbnail candidates to try: stored URL first, then a
 * lower-resolution YouTube thumbnail derived from the source URL. Empty list
 * means render the neutral placeholder.
 */
export function thumbnailCandidates(
  thumbnailUrl: string | null | undefined,
  sourceUrl?: string | null,
): string[] {
  const out: string[] = [];
  if (thumbnailUrl && /^https?:\/\//i.test(thumbnailUrl) && !/picsum\.photos/i.test(thumbnailUrl)) {
    out.push(thumbnailUrl);
  }
  const yt = extractYouTubeId(sourceUrl);
  if (yt) {
    const hq = `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
    if (!out.includes(hq)) out.push(hq);
  }
  return out;
}
