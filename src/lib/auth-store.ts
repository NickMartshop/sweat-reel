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
let initStarted = false;

function setOnboardedFromStorage() {
  try {
    state.onboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
  } catch {}
}

function applyAuthUser(user: User | null, hydrated = true) {
  state = {
    hydrated,
    onboarded: !!user || state.onboarded,
    user,
  };
  if (user) {
    try {
      localStorage.setItem(ONBOARDED_KEY, "true");
    } catch {}
  }
  emit();
}

async function refreshSession() {
  if (typeof window === "undefined") return state;
  setOnboardedFromStorage();
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      applyAuthUser(null);
      return state;
    }

    // `getUser()` revalidates the restored token with the auth server. If it
    // fails, clear only the in-memory user state and let Supabase refresh or
    // sign the user out naturally.
    const { data: userData, error } = await supabase.auth.getUser();
    applyAuthUser(error ? null : (userData.user ?? sessionData.session.user));
  } catch {
    state = { ...state, hydrated: true };
    emit();
  }
  return state;
}

function ensureInit() {
  if (initStarted || typeof window === "undefined") return;
  initStarted = true;
  queueMicrotask(() => {
    void refreshSession();

    supabase.auth.onAuthStateChange((event, session) => {
      applyAuthUser(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        void import("./premium-store")
          .then(({ premiumStore }) => premiumStore.clear())
          .catch(() => {});
      }

      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        void import("./premium-store")
          .then(({ premiumStore }) => premiumStore.refreshPremium(session.user.id))
          .catch(() => {});
      }
    });
  });
}

ensureInit();

export const authStore = {
  get: () => state,
  refresh: refreshSession,
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
    applyAuthUser(null);
  },
};

export function useAuth() {
  const [snap, setSnap] = useState<AuthState>(state);
  useEffect(() => {
    ensureInit();
    setSnap(state);
    return authStore.subscribe(() => setSnap({ ...state }));
  }, []);
  return snap;
}
