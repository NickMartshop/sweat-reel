import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "./auth-store";
import { getCurrentMonday, todayDateString } from "./fitvault-data";

export type FitnessGoal = "build" | "lose" | "flex" | "general";

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
  fitness_goal?: FitnessGoal | null;
  default_difficulty?: "Easy" | "Medium" | "Hard";
  rest_timer_seconds?: number;
  auto_advance_rest?: boolean;
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
  logCompleted: async (workoutId: string | null, durationMins: number) => {
    const user = authStore.get().user;
    if (!user) throw new Error("Not signed in");
    const today = todayDateString();
    const { error: insErr } = await supabase.from("completed_workouts").insert({
      user_id: user.id,
      workout_id: workoutId,
      duration_mins: durationMins,
    });
    if (insErr) throw insErr;

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
      if (diff === 0) newStreak = streak;
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
  updateNotifications: async (enabled: boolean, time?: string) => {
    const user = authStore.get().user;
    if (!user) return;
    const patch: any = { notifications_enabled: enabled };
    if (time) patch.reminder_time = time;
    await supabase.from("profiles").update(patch).eq("id", user.id);
    if (state.profile) {
      state = {
        ...state,
        profile: {
          ...state.profile,
          notifications_enabled: enabled,
          reminder_time: time ?? state.profile.reminder_time,
        },
      };
      emit();
    }
  },
  setReferredBy: async (ref: string) => {
    const user = authStore.get().user;
    if (!user) return;
    if (state.profile?.referred_by) return;
    if (ref === user.id.slice(0, 8)) return;
    await supabase
      .from("profiles")
      .update({ referred_by: ref } as any)
      .eq("id", user.id);
  },
  setFitnessGoal: async (goal: FitnessGoal) => {
    const user = authStore.get().user;
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ fitness_goal: goal } as any)
      .eq("id", user.id);
    if (state.profile) {
      state = {
        ...state,
        profile: { ...state.profile, fitness_goal: goal },
      };
      emit();
    }
  },
  updatePreferences: async (patch: {
    default_difficulty?: "Easy" | "Medium" | "Hard";
    rest_timer_seconds?: number;
    auto_advance_rest?: boolean;
  }) => {
    const user = authStore.get().user;
    if (!user) return;
    await supabase.from("profiles").update(patch as any).eq("id", user.id);
    if (state.profile) {
      state = { ...state, profile: { ...state.profile, ...patch } };
      emit();
    }
  },
  // Delete all rows owned by the current user via RLS. auth.users cannot be
  // removed from the client without a service role; support finishes the job.
  purgeOwnedData: async () => {
    const user = authStore.get().user;
    if (!user) return;
    const uid = user.id;
    await Promise.all([
      supabase.from("completed_workouts").delete().eq("user_id", uid),
      supabase.from("weekly_plans").delete().eq("user_id", uid),
      supabase.from("body_stats").delete().eq("user_id", uid),
      supabase.from("workouts").delete().eq("user_id", uid),
    ]);
    await supabase.from("profiles").delete().eq("id", uid);
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
