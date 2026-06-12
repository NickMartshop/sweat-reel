import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SweatReel" },
      { name: "description", content: "Learn how SweatReel handles your data and keeps your workout information secure and private." },
      { property: "og:title", content: "Privacy Policy — SweatReel" },
      { property: "og:description", content: "How SweatReel collects, stores and protects your account and workout data." },
      { property: "og:url", content: "https://sweat-reel.lovable.app/privacy" },
      { name: "twitter:title", content: "Privacy Policy — SweatReel" },
      { name: "twitter:description", content: "How SweatReel collects, stores and protects your account and workout data." },
    ],
    links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/privacy" }],
  }),

  component: PrivacyPage,
});

function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div
        className="w-full max-w-[430px] px-5 pb-12"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <button
          onClick={() => router.history.back()}
          className="press-scale flex items-center gap-2 text-text-secondary py-2 -ml-2 px-2"
        >
          <ArrowLeft size={20} />
          <span className="text-[14px]">Back</span>
        </button>

        <h1 className="text-[28px] font-bold text-white mt-4">Privacy Policy</h1>
        <p className="text-[12px] text-text-secondary mt-1">Last updated: June 2026</p>

        <div className="mt-6 space-y-5 text-[14px] leading-[1.65] text-white/90">
          <p>
            SweatReel is built to help you save and organize your workouts. We collect
            only the information needed to run the app: your email address (for
            account creation and sign-in) and the workouts you choose to save.
          </p>
          <p>
            Your workout data is stored securely with Supabase, our backend provider.
            All data is encrypted in transit and at rest, and only you can access
            the workouts in your library.
          </p>
          <p>
            <span className="text-white font-semibold">We do not sell your data.</span>{" "}
            We do not share personal information with advertisers or third-party
            marketers. Ever.
          </p>
          <p>
            When you save a workout link, we use Google Gemini AI to analyze the
            workout title and description so we can extract exercises and structure
            the content for you. Only text is sent — never the video itself, and
            never any personal data.
          </p>
          <p>
            You can delete your account and all associated workout data at any time
            from the Profile screen. Deletion is permanent and immediate.
          </p>
          <p>
            Questions, requests, or concerns? Reach out to{" "}
            <span className="text-primary">privacy@fitvault.app</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
