import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const adsClient = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;
    const adsConfigured = !!adsClient && adsClient !== "PENDING";
    const scripts: Array<{ src: string; async?: boolean; crossOrigin?: string }> = [
      { src: "https://checkout.razorpay.com/v1/checkout.js", async: true },
    ];
    if (adsConfigured) {
      scripts.push({
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`,
        async: true,
        crossOrigin: "anonymous",
      });
    }
    return ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      {
        httpEquiv: "Content-Security-Policy",
        content:
          "default-src 'self' https:; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://pagead2.googlesyndication.com https://www.googletagmanager.com; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.razorpay.com https://noembed.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://api.razorpay.com https://checkout.razorpay.com;",
      },
      { name: "theme-color", content: "#4361EE" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "SweatReel" },
      { name: "robots", content: "index, follow" },
      { name: "author", content: "SweatReel" },
      {
        name: "keywords",
        content:
          "workout organizer, fitness app, save workout reels, workout planner, gym tracker, exercise library, SweatReel",
      },
      { title: "SweatReel — Save & Organize Workout Videos" },
      { name: "description", content: "Save workout videos from YouTube, Instagram & TikTok. Build your personal fitness library. Plan your week. Track your streak. Free to start." },
      { property: "og:title", content: "SweatReel — Workout Organizer" },
      { property: "og:description", content: "Save & organize your workout videos. Plan your week. Track your streak." },
      { property: "og:url", content: "https://sweat-reel.lovable.app" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SweatReel — Workout Organizer" },
      { name: "twitter:description", content: "Save & organize your workout videos. Plan your week. Track your streak." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/3367623f-e56e-4a1f-b855-cd58d2799ebc" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/3367623f-e56e-4a1f-b855-cd58d2799ebc" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: "https://sweat-reel.lovable.app" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts,
  });
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
