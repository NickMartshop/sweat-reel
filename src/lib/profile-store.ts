import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "./auth-store";
import { getCurrentMonday, todayDateString } from "./fitvault-data";

export interface Profile {
  id: string;
  name: string;
  email: string;
  streak_count: number;
  best_streak: number;
  last_workout_date: string | null;
  total_workouts: number;
  created_at: string;
  notifications_enabled?: boolean;
  reminder_time?: string | null;
  ai_extractions_count?: number;
  unlocked_achievements?: string[];
  referred_by?: string | null;
}

interface ProfileState {
  loading: boolean;
  profile: Profile | null;
  weeklyCompletedCount: number;
}

let state: ProfileState = {
  loading: true,
  profile: null,
  weeklyCompletedCount: 0,
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function load() {
  const user = authStore.get().user;
  if (!user) {
    state = { loading: false, profile: null, weeklyCompletedCount: 0 };
    emit();
    return;
  }
  state = { ...state, loading: true };
  emit();
  try {
    const monday = getCurrentMonday();
    const [{ data: prof }, { count }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("completed_workouts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("completed_at", `${monday}T00:00:00.000Z`),
    ]);
    state = {
      loading: false,
      profile: (prof as Profile) ?? null,
      weeklyCompletedCount: count ?? 0,
    };
  } catch {
    state = { ...state, loading: false };
  }
  emit();
}

let initialized = false;
function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  authStore.subscribe(() => load());
  load();
}

export const profileStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  reload: load,
  /**
   * Log a completed workout. Updates streak, totals, and inserts a row.
   * Returns the new streak count.
   */
  logCompleted: async (workoutId: string | null, durationMins: number) => {
    const user = authStore.get().user;
    if (!user) throw new Error("Not signed in");
    const today = todayDateString();

    // Insert completed row
    const { error: insErr } = await supabase.from("completed_workouts").insert({
      user_id: user.id,
      workout_id: workoutId,
      duration_mins: durationMins,
    });
    if (insErr) throw insErr;

    // Read current profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("streak_count, best_streak, last_workout_date, total_workouts")
      .eq("id", user.id)
      .maybeSingle();

    const last = prof?.last_workout_date ?? null;
    const streak = prof?.streak_count ?? 0;
    const best = prof?.best_streak ?? 0;
    const total = prof?.total_workouts ?? 0;

    let newStreak = 1;
    if (last) {
      const lastDate = new Date(last + "T00:00:00");
      const todayDate = new Date(today + "T00:00:00");
      const diff = Math.round(
        (todayDate.getTime() - lastDate.getTime()) / 86400000,
      );
      if (diff === 0) newStreak = streak; // same day, no change
      else if (diff === 1) newStreak = streak + 1;
      else newStreak = 1;
    }
    const newBest = Math.max(best, newStreak);
    const newTotal = total + 1;

    const { error: upErr } = await supabase
      .from("profiles")
      .update({
        streak_count: newStreak,
        best_streak: newBest,
        last_workout_date: today,
        total_workouts: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (upErr) throw upErr;

    await load();
    return newStreak;
  },
};

export function useProfile() {
  const [snap, setSnap] = useState(state);
  useEffect(() => {
    ensureInit();
    setSnap(state);
    return profileStore.subscribe(() => setSnap({ ...state }));
  }, []);
  return snap;
}
