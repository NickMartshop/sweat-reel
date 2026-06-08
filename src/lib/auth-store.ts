import { useSyncExternalStore } from "react";

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthState {
  hydrated: boolean;
  onboarded: boolean;
  user: AuthUser | null;
}

const USER_KEY = "fitvault_user";
const ONBOARDED_KEY = "fitvault_onboarded";

let state: AuthState = { hydrated: false, onboarded: false, user: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function hydrate() {
  if (typeof window === "undefined") return;
  try {
    const onboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    state = { hydrated: true, onboarded, user };
  } catch {
    state = { hydrated: true, onboarded: false, user: null };
  }
  emit();
}

if (typeof window !== "undefined") {
  // hydrate on next tick so subscribers exist
  queueMicrotask(hydrate);
}

export const authStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  signIn: (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ONBOARDED_KEY, "true");
    state = { hydrated: true, onboarded: true, user };
    emit();
  },
  signOut: () => {
    localStorage.removeItem(USER_KEY);
    state = { ...state, user: null };
    emit();
  },
  completeOnboarding: () => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    state = { ...state, onboarded: true };
    emit();
  },
};

const serverSnap: AuthState = { hydrated: false, onboarded: false, user: null };

export function useAuth() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    () => serverSnap,
  );
}
