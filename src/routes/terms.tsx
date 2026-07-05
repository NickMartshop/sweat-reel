import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SweatReel" },
      {
        name: "description",
        content:
          "Terms of service for using SweatReel — personal use, subscriptions, refunds and acceptable use.",
      },
      { property: "og:title", content: "Terms of Service — SweatReel" },
      {
        property: "og:description",
        content: "Terms covering personal use, subscriptions, and refunds on SweatReel.",
      },
      { property: "og:url", content: "https://sweat-reel.lovable.app/terms" },
      { name: "twitter:title", content: "Terms of Service — SweatReel" },
      {
        name: "twitter:description",
        content: "Terms covering personal use, subscriptions, and refunds on SweatReel.",
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

        <div className="mt-6 space-y-4 text-[14px] leading-[1.65] text-white/90">
          <ul className="list-disc pl-5 space-y-3">
            <li>SweatReel is for personal, non-commercial use only.</li>
            <li>
              Do not misuse, abuse, or reverse-engineer the app, its APIs, or its
              infrastructure.
            </li>
            <li>
              We may update features, add new ones, or change pricing with reasonable
              notice.
            </li>
            <li>
              Paid subscriptions auto-renew unless cancelled before the next billing
              cycle.
            </li>
            <li>
              Refunds are considered at our discretion within 7 days of purchase.
            </li>
          </ul>
          <p className="pt-3">
            Questions? Reach out to{" "}
            <span className="text-primary">support@sweatreel.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
