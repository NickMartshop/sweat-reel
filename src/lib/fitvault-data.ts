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
  thumbnail_url: string;
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
    thumbnail_url:
      row.thumbnail_url ||
      `https://picsum.photos/seed/${row.id}/400/225`,
    source_url: row.url ?? undefined,
    platform: (row.platform ?? null) as Platform,
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
  };
}
