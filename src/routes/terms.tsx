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

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-[15px] font-semibold text-white">
        {n}. {title}
      </h2>
      <div className="mt-1.5 text-[14px] leading-[1.65] text-white/85 space-y-2">
        {children}
      </div>
    </section>
  );
}

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

        <Section n={1} title="Acceptance">
          <p>
            By using SweatReel, you agree to these Terms. If you disagree, please
            stop using the app.
          </p>
        </Section>

        <Section n={2} title="What SweatReel Is">
          <p>
            SweatReel is a personal fitness organization tool. We help you save,
            organize, and plan workouts from YouTube, Instagram, and TikTok. We
            do not host or own any workout content — we only store links and
            your personal notes about them.
          </p>
        </Section>

        <Section n={3} title="Your Account">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>You are responsible for maintaining account security.</li>
            <li>You must be 13+ years old to use SweatReel.</li>
            <li>Do not share your login credentials.</li>
          </ul>
        </Section>

        <Section n={4} title="Subscriptions and Payments">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>SweatReel Pro subscriptions are billed via Razorpay.</li>
            <li>Payments are processed in INR.</li>
            <li>Monthly plans renew every 30 days.</li>
            <li>Annual plans renew every 365 days.</li>
            <li>
              Refunds may be issued within 7 days of purchase at our discretion —
              email <span className="text-primary">support@sweatreel.com</span>.
            </li>
            <li>
              Cancellation: email{" "}
              <span className="text-primary">support@sweatreel.com</span> before
              the next renewal date.
            </li>
          </ul>
        </Section>

        <Section n={5} title="Affiliate Disclosure">
          <p>
            The Gear section contains Amazon affiliate links. We earn a small
            commission (4-8%) if you purchase through these links. This doesn't
            affect the price you pay. We only recommend products relevant to
            fitness.
          </p>
        </Section>

        <Section n={6} title="Limitations">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>SweatReel is provided 'as is' without warranties.</li>
            <li>We are not liable for fitness outcomes or injuries.</li>
            <li>Always consult a physician before starting exercise.</li>
          </ul>
        </Section>

        <Section n={7} title="Contact">
          <p>
            Email: <span className="text-primary">support@sweatreel.com</span>
            <br />
            Developer: SweatReel (India)
          </p>
        </Section>
      </div>
    </div>
  );
}
