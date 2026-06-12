import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthScreen } from "@/components/fitvault/AuthScreen";
import { Onboarding } from "@/components/fitvault/Onboarding";
import { ToastHost } from "@/components/fitvault/Toast";
import { authStore, useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to SweatReel" },
      {
        name: "description",
        content:
          "Sign in to SweatReel to access your workout library, plan your weekly routine, and track your fitness progress.",
      },
      { property: "og:title", content: "Sign in to SweatReel" },
      {
        property: "og:description",
        content:
          "Access your saved workouts, weekly plan and progress tracking. Sign in or create your SweatReel account.",
      },
      { property: "og:url", content: "https://sweat-reel.lovable.app/auth" },
      { name: "twitter:title", content: "Sign in to SweatReel" },
      {
        name: "twitter:description",
        content:
          "Access your saved workouts, weekly plan and progress tracking. Sign in or create your SweatReel account.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/auth" }],
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
