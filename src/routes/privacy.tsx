import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SweatReel" },
      {
        name: "description",
        content:
          "Learn how SweatReel handles your data and keeps your workout information secure and private.",
      },
      { property: "og:title", content: "Privacy Policy — SweatReel" },
      {
        property: "og:description",
        content:
          "How SweatReel collects, stores and protects your account and workout data.",
      },
      { property: "og:url", content: "https://sweat-reel.lovable.app/privacy" },
      { name: "twitter:title", content: "Privacy Policy — SweatReel" },
      {
        name: "twitter:description",
        content:
          "How SweatReel collects, stores and protects your account and workout data.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/privacy" }],
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

        <div className="mt-6 space-y-6">
          <Section title="1. Data We Collect">
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address and name for account creation</li>
              <li>Workout URLs and titles you save (your content)</li>
              <li>Body stats if voluntarily logged</li>
              <li>Streak and workout completion data</li>
              <li>Device type and browser (automatically)</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Data">
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve SweatReel features</li>
              <li>To send workout reminders (only if you enable)</li>
              <li>
                We <span className="font-semibold text-white">NEVER</span> sell your
                personal data to third parties
              </li>
            </ul>
          </Section>

          <Section title="3. Third-Party Services">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="text-white font-semibold">Google AdSense:</span>{" "}
                serves ads to free users. Google may use cookies for ad
                personalization.
              </li>
              <li>
                <span className="text-white font-semibold">Razorpay:</span> processes
                payments securely. We do not store your card details.
              </li>
              <li>
                <span className="text-white font-semibold">Google Gemini AI:</span>{" "}
                we send workout titles (text only, no video data) to Gemini for
                exercise suggestions. No personal info is sent.
              </li>
              <li>
                <span className="text-white font-semibold">Amazon Associates:</span>{" "}
                we earn commission on clicks to Amazon products. Your Amazon
                purchase data is governed by Amazon's privacy policy.
              </li>
              <li>
                <span className="text-white font-semibold">Supabase:</span> stores
                your encrypted app data on servers in Singapore.
              </li>
            </ul>
          </Section>

          <Section title="4. Your Rights">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Download your data: contact{" "}
                <span className="text-primary">support@sweatreel.com</span>
              </li>
              <li>Delete your account: Settings → Delete Account</li>
              <li>Opt out of ads: Upgrade to SweatReel Pro</li>
            </ul>
          </Section>

          <Section title="5. Contact">
            <p>
              Email: <span className="text-primary">support@sweatreel.com</span>
            </p>
            <p>Last updated: June 2026</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
