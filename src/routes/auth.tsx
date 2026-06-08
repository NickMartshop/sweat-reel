import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthScreen } from "@/components/fitvault/AuthScreen";
import { Onboarding } from "@/components/fitvault/Onboarding";
import { ToastHost } from "@/components/fitvault/Toast";
import { authStore, useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "FitVault — Sign in" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // After login, redirect to home
  useEffect(() => {
    if (auth.user && typeof window !== "undefined") {
      window.location.replace("/");
    }
  }, [auth.user]);

  if (!mounted || !auth.hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!auth.onboarded) {
    return (
      <>
        <Onboarding onDone={() => authStore.completeOnboarding()} />
        <ToastHost />
      </>
    );
  }

  return (
    <>
      <AuthScreen />
      <ToastHost />
    </>
  );
}
