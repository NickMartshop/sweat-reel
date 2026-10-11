import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rowToWorkout, type Workout } from "./fitvault-data";
import { authStore } from "./auth-store";

interface WorkoutsState {
  loading: boolean;
  workouts: Workout[];
  error: string | null;
}

let state: WorkoutsState = { loading: true, workouts: [], error: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function load() {
  const user = authStore.get().user;
  if (!user) {
    state = { loading: false, workouts: [], error: null };
    emit();
    return;
  }
  state = { ...state, loading: true, error: null };
  emit();
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    state = {
      loading: false,
      workouts: (data ?? []).map(rowToWorkout),
      error: null,
    };
  } catch (e: any) {
    state = { loading: false, workouts: [], error: e.message ?? "Error" };
  }
  emit();
}

let initialized = false;
function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  // Reload on auth changes
  authStore.subscribe(() => load());
  load();
}

export interface NewWorkoutInput {
  title: string;
  url?: string | null;
  thumbnail_url?: string | null;
  muscle_group: string;
  difficulty: string;
  duration_mins: number;
  platform?: string | null;
  exercises: { id: string; name: string; sets: number; reps: number }[];
}

export interface WorkoutUpdateInput {
  title: string;
  muscle_group: string;
  difficulty: string;
  duration_mins: number;
  exercises: { id: string; name: string; sets: number; reps: number }[];
}

export const workoutsStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  reload: load,
  add: async (w: NewWorkoutInput): Promise<Workout> => {
    const user = authStore.get().user;
    if (!user) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        title: w.title,
        url: w.url ?? null,
        thumbnail_url: w.thumbnail_url ?? null,
        muscle_group: w.muscle_group,
        difficulty: w.difficulty,
        duration_mins: w.duration_mins,
        platform: w.platform ?? null,
        exercises: w.exercises as any,
      })
      .select("*")
      .single();
    if (error) throw error;
    const wk = rowToWorkout(data);
    state = { ...state, workouts: [wk, ...state.workouts] };
    emit();
    return wk;
  },
  /** Owner-scoped update. Source URL is intentionally not editable here. */
  update: async (id: string, patch: WorkoutUpdateInput): Promise<Workout> => {
    const user = authStore.get().user;
    if (!user) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("workouts")
      .update({
        title: patch.title,
        muscle_group: patch.muscle_group,
        difficulty: patch.difficulty,
        duration_mins: patch.duration_mins,
        exercises: patch.exercises as any,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Workout not found");
    const wk = rowToWorkout(data);
    state = { ...state, workouts: state.workouts.map((w) => (w.id === id ? wk : w)) };
    emit();
    return wk;
  },
  remove: async (id: string) => {
    const user = authStore.get().user;
    if (!user) throw new Error("Not signed in");
    const prev = state.workouts;
    state = { ...state, workouts: prev.filter((w) => w.id !== id) };
    emit();
    const { error, count } = await supabase
      .from("workouts")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error || count === 0) {
      state = { ...state, workouts: prev };
      emit();
      throw error ?? new Error("Workout not found");
    }
  },
};

export function useWorkouts() {
  const [snap, setSnap] = useState<WorkoutsState>(state);
  useEffect(() => {
    ensureInit();
    setSnap(state);
    return workoutsStore.subscribe(() => setSnap({ ...state }));
  }, []);
  return snap;
}
