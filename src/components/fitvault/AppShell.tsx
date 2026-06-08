import { useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Onboarding } from "./Onboarding";
import { AuthScreen } from "./AuthScreen";
import { ToastHost } from "./Toast";
import { authStore, useAuth } from "@/lib/auth-store";

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pre-mount / pre-hydration: render dark background to avoid flash
  if (!mounted || !auth.hydrated) {
    return <div className="min-h-screen w-full bg-background" />;
  }

  if (!auth.onboarded) {
    return (
      <>
        <Onboarding onDone={() => authStore.completeOnboarding()} />
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
      </div>
    </div>
  );
}
