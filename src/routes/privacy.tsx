import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SweatReel" },
      {
        name: "description",
        content:
          "How SweatReel collects, uses, protects, and deletes account and workout data.",
      },
      { property: "og:title", content: "Privacy Policy — SweatReel" },
      {
        property: "og:description",
        content:
          "How SweatReel collects, uses, protects, and deletes account and workout data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sweatreel.com/privacy" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy — SweatReel" },
      {
        name: "twitter:description",
        content:
          "How SweatReel collects, uses, protects, and deletes account and workout data.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sweatreel.com/privacy" }],
  }),
  component: PrivacyPage,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[16px] font-semibold text-white">{title}</h2>
      <div className="mt-2 text-[14px] leading-[1.65] text-white/90 space-y-2">
        {children}
      </div>
    </section>
  );
}

function PrivacyPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen w-full bg-background flex justify-center">
      <div
        className="w-full max-w-[640px] px-5 pb-12"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <button
          onClick={() => router.history.back()}
          className="press-scale flex items-center gap-2 text-text-secondary py-2 -ml-2 px-2"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="text-[14px]">Back</span>
        </button>

        <h1 className="text-[28px] font-bold text-white mt-4">Privacy Policy</h1>
        <p className="text-[12px] text-text-secondary mt-1">
          Effective date: September 30, 2026
        </p>

        <div className="mt-6 space-y-6">
          <Section title="1. Information We Collect">
            <p>We collect information needed to provide your SweatReel account and features:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account data, including your email, identity information, profile, and name.</li>
              <li>
                User data you provide, including workouts, plans, completed workout history,
                and body stats.
              </li>
              <li>
                Workout input, output, and URLs processed when you use AI extraction.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Information">
            <p>
              We use this information to authenticate your account, save and organize your
              workouts, build plans, record completed workouts and body stats, and provide the
              features you request.
            </p>
          </Section>

          <Section title="3. AI Extraction and YouTube Metadata">
            <p>
              AI extraction processes workout input, output, and URLs through SweatReel's
              existing AI gateway to produce workout information. Review AI-generated results
              before relying on them.
            </p>
            <p>
              For YouTube links, SweatReel obtains public metadata through server-side YouTube
              oEmbed. SweatReel does not download or host YouTube videos.
            </p>
          </Section>

          <Section title="4. Service Providers and Data Security">
            <p>
              SweatReel uses its managed backend and authentication provider, Supabase, to
              support account authentication and app data storage. Access controls are used to
              limit account data to authorized access. No internet transmission or storage
              system can be guaranteed completely secure.
            </p>
          </Section>

          <Section title="5. Advertising and Affiliate Links">
            <p>
              The Android app has no third-party advertising SDK and shows no ads. SweatReel's
              Gear Store contains Amazon affiliate links. If you purchase through an eligible
              link, SweatReel may earn a commission, without changing your purchase price.
              Amazon handles activity on its own service under its own terms and privacy policy.
            </p>
          </Section>

          <Section title="6. Payments">
            <p>
              Razorpay is used only for the existing iOS and web payment flow. No payment is
              collected through Razorpay in the Android app, and Google Play billing is not
              enabled for Android.
            </p>
          </Section>

          <Section title="7. Account Deletion and Retention">
            <p>
              You can request account deletion in the app through Profile → Delete Account, or
              follow the instructions on the public{" "}
              <Link
                to="/delete-account"
                className="text-primary underline underline-offset-4"
              >
                account deletion page
              </Link>
              . Deletion removes your account data and associated user data, including workouts,
              plans, completed workout history, and body stats.
            </p>
            <p>
              Information required to meet an applicable legal obligation may be retained only
              as required by that obligation. Other account and user data covered by the deletion
              request is deleted after the request is verified and processed.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              Questions or privacy requests can be sent to{" "}
              <a
                href="mailto:support@sweatreel.com"
                className="text-primary underline underline-offset-4"
              >
                support@sweatreel.com
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}