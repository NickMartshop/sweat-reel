import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SweatReel" },
      {
        name: "description",
        content:
          "SweatReel Terms of Service — understand your rights, our responsibilities, and how we handle your fitness data.",
      },
      { property: "og:title", content: "Terms of Service — SweatReel" },
      {
        property: "og:description",
        content: "Terms of Service for SweatReel - your rights and our responsibilities.",
      },
      { property: "og:url", content: "https://sweat-reel.lovable.app/terms" },
      { name: "twitter:title", content: "Terms of Service — SweatReel" },
      {
        name: "twitter:description",
        content: "Terms of Service for SweatReel - your rights and our responsibilities.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/terms" }],
  }),

  component: TermsPage,
});

function TermsPage() {
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

        <h1 className="text-[28px] font-bold text-white mt-4">Terms of Service</h1>
        <p className="text-[12px] text-text-secondary mt-1">Last updated: June 2026</p>

        <div className="mt-6 space-y-5 text-[14px] leading-[1.65] text-white/90">
          <p>
            Welcome to SweatReel. These Terms of Service govern your use of our
            fitness app and services. By using SweatReel, you agree to these terms.
          </p>

          <h2 className="text-[16px] font-semibold text-white">Free and Pro Tiers</h2>
          <p>
            SweatReel offers both free and Pro subscription tiers. The free tier
            includes core features to save, organize, and track your workouts. Pro
            subscribers get access to premium features, advanced analytics, and
            priority support. Subscription fees are billed in advance and are
            non-refundable except as required by law.
          </p>

          <h2 className="text-[16px] font-semibold text-white">Your Data</h2>
          <p>
            <span className="text-white font-semibold">You own your data.</span>{" "}
            Your workouts, plans, and progress history belong to you. We store your
            data securely on our servers and will never sell it to third parties.
            You can export or delete your data at any time from the Profile screen.
          </p>

          <h2 className="text-[16px] font-semibold text-white">Service Availability</h2>
          <p>
            We strive to keep SweatReel available 24/7, but we provide no guarantee
            of uptime or uninterrupted service. We may perform scheduled maintenance
            or experience unexpected outages. We are not liable for any losses
            resulting from service unavailability.
          </p>

          <h2 className="text-[16px] font-semibold text-white">Acceptable Use</h2>
          <p>
            You agree to use SweatReel only for its intended purpose — managing your
            personal fitness journey. You may not use the service for illegal
            activities, to store harmful content, or to abuse our systems. We
            reserve the right to terminate accounts that violate these terms.
          </p>

          <h2 className="text-[16px] font-semibold text-white">Disclaimer</h2>
          <p>
            SweatReel is provided "as is" without warranties of any kind. We do not
            guarantee specific fitness results, and we are not responsible for
            injuries or health issues arising from workouts you save or follow.
            Always consult a medical professional before beginning any fitness
            program.
          </p>

          <h2 className="text-[16px] font-semibold text-white">Changes to Terms</h2>
          <p>
            We may update these terms occasionally. Continued use of SweatReel after
            changes means you accept the new terms. We will notify you of
            significant changes via email or in-app notification.
          </p>

          <h2 className="text-[16px] font-semibold text-white">Contact Us</h2>
          <p>
            Questions about these terms? Reach out to us at{" "}
            <a
              href="mailto:hello@sweatreel.app"
              className="text-primary hover:underline"
            >
              hello@sweatreel.app
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
