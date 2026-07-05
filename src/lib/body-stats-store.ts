import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "./auth-store";

export interface BodyStat {
  id: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  notes: string | null;
  logged_at: string;
}

interface State {
  loading: boolean;
  entries: BodyStat[];
}

let state: State = { loading: true, entries: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function load() {
  const user = authStore.get().user;
  if (!user) {
    state = { loading: false, entries: [] };
    emit();
    return;
  }
  state = { ...state, loading: true };
  emit();
  const { data } = await supabase
    .from("body_stats")
    .select("id, weight_kg, body_fat_pct, notes, logged_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(30);
  state = {
    loading: false,
    entries: (data as BodyStat[]) ?? [],
  };
  emit();
}

let initialized = false;
function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  authStore.subscribe(() => load());
  load();
}

export const bodyStatsStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  reload: load,
  add: async (input: {
    weight_kg?: number | null;
    body_fat_pct?: number | null;
    notes?: string | null;
  }) => {
    const user = authStore.get().user;
    if (!user) throw new Error("Not signed in");
    const { error } = await supabase.from("body_stats").insert({
      user_id: user.id,
      weight_kg: input.weight_kg ?? null,
      body_fat_pct: input.body_fat_pct ?? null,
      notes: input.notes ?? null,
    });
    if (error) throw error;
    await load();
  },
};

export function useBodyStats() {
  const [snap, setSnap] = useState(state);
  useEffect(() => {
    ensureInit();
    setSnap(state);
    return bodyStatsStore.subscribe(() => setSnap({ ...state }));
  }, []);
  return snap;
}
