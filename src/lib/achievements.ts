import { supabase } from "@/integrations/supabase/client";
import { authStore } from "./auth-store";

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  gradient: string;
  darkText?: boolean;
  shimmer?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_sweat",
    title: "First Sweat",
    emoji: "💪",
    description: "Complete your first workout",
    gradient: "linear-gradient(135deg, #4361EE, #6A82F0)",
  },
  {
    id: "week_warrior",
    title: "Week Warrior",
    emoji: "📅",
    description: "Plan all 7 days of a week",
    gradient: "linear-gradient(135deg, #7B2FBE, #A961E8)",
  },
  {
    id: "streak_7",
    title: "7-Day Streak",
    emoji: "🔥",
    description: "Hit a 7-day workout streak",
    gradient: "linear-gradient(135deg, #FF6B35, #FFA26B)",
  },
  {
    id: "library_builder",
    title: "Library Builder",
    emoji: "📚",
    description: "Save 10+ workouts",
    gradient: "linear-gradient(135deg, #06D6A0, #4BE3C1)",
  },
  {
    id: "ai_user",
    title: "AI User",
    emoji: "✨",
    description: "Use AI extraction 5+ times",
    gradient: "linear-gradient(135deg, #FFD166, #FFE29A)",
    darkText: true,
  },
  {
    id: "streak_30",
    title: "30-Day Legend",
    emoji: "👑",
    description: "Hit a 30-day streak",
    gradient: "linear-gradient(135deg, #FFD700, #FFB300, #FFD700)",
    darkText: true,
    shimmer: true,
  },
];

export function evaluateAchievements(input: {
  totalWorkouts: number;
  streak: number;
  bestStreak: number;
  workoutsSaved: number;
  plannedDaysThisWeek: number;
  aiExtractions: number;
}): string[] {
  const unlocked: string[] = [];
  if (input.totalWorkouts >= 1) unlocked.push("first_sweat");
  if (input.plannedDaysThisWeek >= 7) unlocked.push("week_warrior");
  if (input.bestStreak >= 7 || input.streak >= 7) unlocked.push("streak_7");
  if (input.workoutsSaved >= 10) unlocked.push("library_builder");
  if (input.aiExtractions >= 5) unlocked.push("ai_user");
  if (input.bestStreak >= 30 || input.streak >= 30) unlocked.push("streak_30");
  return unlocked;
}

// Achievement unlock event bus
type Listener = (a: Achievement) => void;
const listeners = new Set<Listener>();
export const achievementBus = {
  emit(a: Achievement) {
    listeners.forEach((l) => l(a));
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export async function checkAchievements() {
  const user = authStore.get().user;
  if (!user) return;
  const { data: newlyUnlocked, error } = await supabase.rpc("sync_my_achievements");
  if (error) throw error;
  for (const id of newlyUnlocked ?? []) {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (a) achievementBus.emit(a);
  }
}

export async function fetchUnlocked(): Promise<string[]> {
  const user = authStore.get().user;
  if (!user) return [];
  const { data } = await supabase
    .from("profiles")
    .select("unlocked_achievements")
    .eq("id", user.id)
    .maybeSingle();
  return Array.isArray(data?.unlocked_achievements)
    ? (data!.unlocked_achievements as string[])
    : [];
}
