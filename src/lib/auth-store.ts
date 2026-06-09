import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const ONBOARDED_KEY = "fitvault_onboarded";

interface AuthState {
  hydrated: boolean;
  onboarded: boolean;
  user: User | null;
}

let state: AuthState = { hydrated: false, onboarded: false, user: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function setOnboardedFromStorage() {
  try {
    state.onboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
  } catch {}
}

if (typeof window !== "undefined") {
  queueMicrotask(async () => {
    setOnboardedFromStorage();
    const { data } = await supabase.auth.getSession();
    state = {
      hydrated: true,
      onboarded: state.onboarded || !!data.session,
      user: data.session?.user ?? null,
    };
    emit();

    supabase.auth.onAuthStateChange((_event, session) => {
      state = {
        hydrated: true,
        onboarded: !!session || state.onboarded,
        user: session?.user ?? null,
      };
      if (session) {
        try {
          localStorage.setItem(ONBOARDED_KEY, "true");
        } catch {}
      }
      emit();
    });
  });
}

export const authStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  completeOnboarding: () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, "true");
    } catch {}
    state = { ...state, onboarded: true };
    emit();
  },
  signOut: async () => {
    await supabase.auth.signOut();
  },
};

export function useAuth() {
  const [snap, setSnap] = useState<AuthState>(state);
  useEffect(() => {
    setSnap(state);
    return authStore.subscribe(() => setSnap({ ...state }));
  }, []);
  return snap;
}
