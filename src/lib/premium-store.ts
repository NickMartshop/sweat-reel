/*
  SECURITY: Supabase RLS is active on all tables. Users can only read/write
  their own rows via `auth.uid() = user_id`. The publishable/anon key in
  VITE_SUPABASE_PUBLISHABLE_KEY is safe for frontend use — it only works
  within RLS boundaries. Never use the service_role key in frontend code.
*/
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "./auth-store";

export type PremiumPlan = "free" | "monthly" | "annual";

interface PremiumState {
  isPremium: boolean;
  plan: PremiumPlan;
  expiresAt: Date | null;
  aiExtractionsUsed: number;
  isLoading: boolean;
}

let state: PremiumState = {
  isPremium: false,
  plan: "free",
  expiresAt: null,
  aiExtractionsUsed: 0,
  isLoading: true,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function checkPremium(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "is_premium, premium_plan, premium_expires_at, ai_extractions_used",
      )
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      state = { ...state, isPremium: false, isLoading: false };
      emit();
      return;
    }

    const row = data as any;
    const now = new Date();
    const expiresAt = row.premium_expires_at
      ? new Date(row.premium_expires_at)
      : null;
    const isActive = !!row.is_premium && (!expiresAt || expiresAt > now);

    state = {
      isPremium: isActive,
      plan: (row.premium_plan as PremiumPlan) || "free",
      expiresAt,
      aiExtractionsUsed: row.ai_extractions_used ?? 0,
      isLoading: false,
    };
    emit();
  } catch {
    // On network error, don't punish users — treat as free tier.
    state = { ...state, isPremium: false, isLoading: false };
    emit();
  }
}

async function refreshPremium(userId: string) {
  state = { ...state, isLoading: true };
  emit();
  await checkPremium(userId);
}

function clear() {
  state = {
    isPremium: false,
    plan: "free",
    expiresAt: null,
    aiExtractionsUsed: 0,
    isLoading: false,
  };
  emit();
}

// --- Success screen event bus (fired after payment activates) ---
type SuccessListener = () => void;
const successListeners = new Set<SuccessListener>();
function fireSuccess() {
  successListeners.forEach((l) => l());
}

export const premiumStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  checkPremium,
  refreshPremium,
  clear,
  fireSuccess,
  onSuccess: (l: SuccessListener) => {
    successListeners.add(l);
    return () => {
      successListeners.delete(l);
    };
  },
};

let initialized = false;
function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const boot = () => {
    const user = authStore.get().user;
    if (user) checkPremium(user.id);
    else clear();
  };
  boot();
  authStore.subscribe(boot);
}

export function usePremium() {
  const [snap, setSnap] = useState(state);
  useEffect(() => {
    ensureInit();
    setSnap(state);
    return premiumStore.subscribe(() => setSnap({ ...state }));
  }, []);
  return snap;
}
