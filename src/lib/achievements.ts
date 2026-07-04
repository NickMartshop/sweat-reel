import { supabase } from "@/integrations/supabase/client";
import { authStore } from "./auth-store";
import { profileStore } from "./profile-store";
import { plansStore } from "./plans-store";
import { workoutsStore } from "./workouts-store";

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

let lastCheckKey = "";

export async function checkAchievements() {
  const user = authStore.get().user;
  if (!user) return;
  const prof = profileStore.get().profile;
  const plans = plansStore.get().entries;
  const workouts = workoutsStore.get().workouts;
  if (!prof) return;

  // Fetch dynamic fields not in local Profile
  const { data: extra } = await supabase
    .from("profiles")
    .select("unlocked_achievements, ai_extractions_count")
    .eq("id", user.id)
    .maybeSingle();

  const already: string[] = Array.isArray(extra?.unlocked_achievements)
    ? (extra!.unlocked_achievements as string[])
    : [];
  const aiCount = (extra as any)?.ai_extractions_count ?? 0;

  const plannedDays = new Set(plans.map((p) => p.day_of_week)).size;

  const shouldHave = evaluateAchievements({
    totalWorkouts: prof.total_workouts,
    streak: prof.streak_count,
    bestStreak: prof.best_streak,
    workoutsSaved: workouts.length,
    plannedDaysThisWeek: plannedDays,
    aiExtractions: aiCount,
  });

  const newlyUnlocked = shouldHave.filter((id) => !already.includes(id));
  if (newlyUnlocked.length === 0) return;

  const merged = Array.from(new Set([...already, ...shouldHave]));
  const key = `${user.id}:${merged.sort().join(",")}`;
  if (key === lastCheckKey) return;
  lastCheckKey = key;

  await supabase
    .from("profiles")
    .update({ unlocked_achievements: merged as any })
    .eq("id", user.id);

  for (const id of newlyUnlocked) {
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
