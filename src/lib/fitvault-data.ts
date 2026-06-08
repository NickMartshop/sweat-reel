export type MuscleGroup = "Chest" | "Back" | "Legs" | "Arms" | "Core" | "Full Body" | "Cardio";
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

export const mockWorkouts: Workout[] = [
  { id: "1", title: "Full Body HIIT 20 Min", muscle_group: "Full Body", difficulty: "Hard", duration_mins: 20, thumbnail_url: "https://picsum.photos/seed/hiit/400/225", platform: "YouTube", source_url: "https://youtube.com/watch?v=ml6cT4AZdqI", exercises: [
    { id: "1a", name: "Jumping Jacks", sets: 3, reps: 30 },
    { id: "1b", name: "Burpees", sets: 3, reps: 12 },
    { id: "1c", name: "Mountain Climbers", sets: 3, reps: 20 },
    { id: "1d", name: "Push-ups", sets: 3, reps: 15 },
  ] },
  { id: "2", title: "Chest & Triceps Workout", muscle_group: "Chest", difficulty: "Medium", duration_mins: 45, thumbnail_url: "https://picsum.photos/seed/chest/400/225", platform: "YouTube", source_url: "https://youtube.com/watch?v=example", exercises: [
    { id: "2a", name: "Bench Press", sets: 4, reps: 10 },
    { id: "2b", name: "Incline Dumbbell Press", sets: 3, reps: 12 },
    { id: "2c", name: "Tricep Dips", sets: 3, reps: 15 },
    { id: "2d", name: "Cable Flyes", sets: 3, reps: 12 },
  ] },
  { id: "3", title: "Leg Day Destroyer", muscle_group: "Legs", difficulty: "Hard", duration_mins: 60, thumbnail_url: "https://picsum.photos/seed/legs/400/225", platform: "Instagram", source_url: "https://instagram.com/reel/example", exercises: [
    { id: "3a", name: "Back Squats", sets: 5, reps: 8 },
    { id: "3b", name: "Romanian Deadlift", sets: 4, reps: 10 },
    { id: "3c", name: "Walking Lunges", sets: 3, reps: 20 },
    { id: "3d", name: "Leg Press", sets: 4, reps: 12 },
  ] },
  { id: "4", title: "Morning Yoga Flow", muscle_group: "Full Body", difficulty: "Easy", duration_mins: 30, thumbnail_url: "https://picsum.photos/seed/yoga/400/225" },
  { id: "5", title: "Back & Biceps Pump", muscle_group: "Back", difficulty: "Medium", duration_mins: 40, thumbnail_url: "https://picsum.photos/seed/back/400/225", platform: "YouTube", source_url: "https://youtube.com/watch?v=example2", exercises: [
    { id: "5a", name: "Pull-ups", sets: 4, reps: 8 },
    { id: "5b", name: "Bent-over Rows", sets: 4, reps: 10 },
    { id: "5c", name: "Barbell Curls", sets: 3, reps: 12 },
  ] },
  { id: "6", title: "Core Crusher 15", muscle_group: "Core", difficulty: "Medium", duration_mins: 15, thumbnail_url: "https://picsum.photos/seed/core/400/225", platform: "TikTok", source_url: "https://tiktok.com/@example/video/1", exercises: [
    { id: "6a", name: "Plank (sec)", sets: 3, reps: 45 },
    { id: "6b", name: "Russian Twists", sets: 3, reps: 30 },
    { id: "6c", name: "Bicycle Crunches", sets: 3, reps: 20 },
  ] },
  { id: "7", title: "Arm Builder Superset", muscle_group: "Arms", difficulty: "Medium", duration_mins: 35, thumbnail_url: "https://picsum.photos/seed/arms/400/225" },
  { id: "8", title: "Cardio Burner Sprint", muscle_group: "Cardio", difficulty: "Hard", duration_mins: 25, thumbnail_url: "https://picsum.photos/seed/cardio/400/225" },
];

// Weekly plan: index 0 = Mon ... 6 = Sun
export const weeklyPlan: Record<number, string[]> = {
  0: ["2", "6"],
  1: [],
  2: ["3"],
  3: ["4"],
  4: ["1"],
  5: [],
  6: ["8"],
};

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning 💪";
  if (h < 18) return "Good Afternoon ⚡";
  return "Good Evening 🌙";
}

export const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function getMondayIndex(d = new Date()): number {
  // 0 = Monday ... 6 = Sunday
  return (d.getDay() + 6) % 7;
}
