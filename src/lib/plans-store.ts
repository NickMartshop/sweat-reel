import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "./auth-store";
import { getCurrentMonday, rowToWorkout, type Workout } from "./fitvault-data";

export type RestType = "active" | "full" | "ice" | "cardio";

export type PlanEntry =
  | {
      kind: "workout";
      id: string;
      day_of_week: number;
      workout: Workout;
    }
  | {
      kind: "rest";
      id: string;
      day_of_week: number;
      rest_type: RestType;
    };

interface PlansState {
  loading: boolean;
  entries: PlanEntry[];
  error: string | null;
}

let state: PlansState = { loading: true, entries: [], error: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function load() {
  const user = authStore.get().user;
  if (!user) {
    state = { loading: false, entries: [], error: null };
    emit();
    return;
  }
  state = { ...state, loading: true };
  emit();
  try {
    const monday = getCurrentMonday();
    const { data, error } = await supabase
      .from("weekly_plans")
      .select("id, day_of_week, rest_type, workouts(*)")
      .eq("user_id", user.id)
      .eq("week_start_date", monday);
    if (error) throw error;
    const entries: PlanEntry[] = (data ?? []).map((r: any): PlanEntry => {
      if (r.workouts) {
        return {
          kind: "workout",
          id: r.id,
          day_of_week: r.day_of_week,
          workout: rowToWorkout(r.workouts),
        };
      }
      return {
        kind: "rest",
        id: r.id,
        day_of_week: r.day_of_week,
        rest_type: (r.rest_type as RestType) ?? "full",
      };
    });
    state = { loading: false, entries, error: null };
  } catch (e: any) {
    state = { loading: false, entries: [], error: e.message ?? "Error" };
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

export const plansStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  reload: load,
  add: async (dayOfWeek: number, workoutId: string) => {
    const user = authStore.get().user;
    if (!user) throw new Error("Not signed in");
    const monday = getCurrentMonday();
    const { error } = await supabase.from("weekly_plans").insert({
      user_id: user.id,
      workout_id: workoutId,
      day_of_week: dayOfWeek,
      week_start_date: monday,
    });
    if (error) throw error;
    await load();
  },
  addRest: async (dayOfWeek: number, restType: RestType) => {
    const user = authStore.get().user;
    if (!user) throw new Error("Not signed in");
    const monday = getCurrentMonday();
    const { error } = await supabase.from("weekly_plans").insert({
      user_id: user.id,
      workout_id: null as any,
      rest_type: restType,
      day_of_week: dayOfWeek,
      week_start_date: monday,
    } as any);
    if (error) throw error;
    await load();
  },
  remove: async (id: string) => {
    const prev = state.entries;
    state = { ...state, entries: prev.filter((e) => e.id !== id) };
    emit();
    const { error } = await supabase.from("weekly_plans").delete().eq("id", id);
    if (error) {
      state = { ...state, entries: prev };
      emit();
      throw error;
    }
  },
};

export function usePlans() {
  const [snap, setSnap] = useState(state);
  useEffect(() => {
    ensureInit();
    setSnap(state);
    return plansStore.subscribe(() => setSnap({ ...state }));
  }, []);
  return snap;
}
