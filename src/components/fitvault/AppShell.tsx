import { useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Onboarding } from "./Onboarding";
import { AuthScreen } from "./AuthScreen";
import { ToastHost } from "./Toast";
import { ReminderPrompt } from "./ReminderPrompt";
import { AchievementToastHost } from "./AchievementToast";
import { authStore, useAuth } from "@/lib/auth-store";
import { useProfile, profileStore } from "@/lib/profile-store";
import { startReminderLoop } from "@/lib/reminders";
import { checkAchievements } from "@/lib/achievements";
import { premiumStore } from "@/lib/premium-store";
import { PremiumSuccessHost } from "./PremiumSuccess";
import { OfflineBanner, useOnline } from "./OfflineBanner";
import { RatingPrompt } from "./RatingPrompt";

const REF_KEY = "sweatreel_ref";

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { profile } = useProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Capture ?ref=xxx into sessionStorage so we can attach it after signup.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      try {
        sessionStorage.setItem(REF_KEY, ref);
      } catch {}
    }
  }, []);

  // Once the user is signed in, persist any stashed referral + goal.
  useEffect(() => {
    if (!auth.user) return;
    let ref: string | null = null;
    let goal: string | null = null;
    try {
      ref = sessionStorage.getItem(REF_KEY);
      goal = sessionStorage.getItem("sweatreel_goal");
    } catch {}
    if (ref) {
      profileStore.setReferredBy(ref).finally(() => {
        try {
          sessionStorage.removeItem(REF_KEY);
        } catch {}
      });
    }
    if (goal && ["build", "lose", "flex", "general"].includes(goal)) {
      profileStore.setFitnessGoal(goal as any).finally(() => {
        try {
          sessionStorage.removeItem("sweatreel_goal");
        } catch {}
      });
    }
  }, [auth.user]);

  // Start reminder loop with live config from the profile.
  useEffect(() => {
    startReminderLoop(() => ({
      enabled: !!profile?.notifications_enabled,
      time: profile?.reminder_time ?? null,
    }));
  }, [profile?.notifications_enabled, profile?.reminder_time]);

  // Evaluate achievements when profile/plans/workouts change.
  useEffect(() => {
    if (!auth.user) return;
    const t = setTimeout(() => {
      checkAchievements().catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [
    auth.user,
    profile?.total_workouts,
    profile?.streak_count,
    profile?.best_streak,
  ]);

  if (!mounted || !auth.hydrated) {
    return <div className="min-h-screen w-full bg-background" />;
  }

  if (!auth.onboarded) {
    return (
      <>
        <Onboarding
          onDone={(goal) => {
            if (goal) {
              try {
                sessionStorage.setItem("sweatreel_goal", goal);
              } catch {}
              profileStore.setFitnessGoal(goal).catch(() => {});
            }
            authStore.completeOnboarding();
          }}
        />
        <ToastHost />
      </>
    );
  }

  if (!auth.user) {
    return (
      <>
        <AuthScreen />
        <ToastHost />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div
        className="relative w-full max-w-[430px] min-h-screen bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <main className="pb-24 px-4 pt-4">{children}</main>
        <BottomNav />
        <ReminderPrompt />
        <AchievementToastHost />
        <PremiumSuccessHost />
      </div>
    </div>
  );
}
