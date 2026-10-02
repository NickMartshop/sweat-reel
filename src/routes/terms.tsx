import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SweatReel" },
      {
        name: "description",
        content:
          "Terms governing SweatReel accounts, workout tools, AI-generated content, payments, and affiliate links.",
      },
      { property: "og:title", content: "Terms of Service — SweatReel" },
      {
        property: "og:description",
        content:
          "Terms governing SweatReel accounts, workout tools, AI-generated content, payments, and affiliate links.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sweatreel.com/terms" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms of Service — SweatReel" },
      {
        name: "twitter:description",
        content:
          "Terms governing SweatReel accounts, workout tools, AI-generated content, payments, and affiliate links.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sweatreel.com/terms" }],
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

        <h1 className="text-[28px] font-bold text-white mt-4">Terms of Service</h1>
        <p className="text-[12px] text-text-secondary mt-1">
          Effective date: September 30, 2026
        </p>

        <Section n={1} title="Acceptance of These Terms">
          <p>
            By accessing or using SweatReel, you agree to these Terms of Service. If you do not
            agree, do not use the service.
          </p>
        </Section>

        <Section n={2} title="The SweatReel Service">
          <p>
            SweatReel helps users save and organize workout links, create plans, track completed
            workout history and body stats, and use AI-assisted workout extraction. Public
            YouTube metadata is obtained through server-side YouTube oEmbed; SweatReel does not
            download or host YouTube videos.
          </p>
        </Section>

        <Section n={3} title="Accounts">
          <p>
            You must provide accurate account information and keep access to your account secure.
            You are responsible for activity performed through your account. You may delete your
            account through Profile → Delete Account or the public{" "}
            <Link to="/delete-account" className="text-primary underline underline-offset-4">
              account deletion page
            </Link>
            .
          </p>
        </Section>

        <Section n={4} title="Acceptable Use">
          <p>
            Do not misuse SweatReel, interfere with the service, attempt unauthorized access, or
            use the service to violate applicable law or another person's rights.
          </p>
        </Section>

        <Section n={5} title="Your Content and Third-Party Links">
          <p>
            You remain responsible for workout URLs, notes, plans, and other information you add.
            Third-party content and services are governed by their own terms. SweatReel does not
            own content available through external links.
          </p>
        </Section>

        <Section n={6} title="AI-Generated Content">
          <p>
            AI extraction processes workout input, output, and URLs through SweatReel's existing
            AI gateway. AI-generated content may be incomplete or inaccurate. You are responsible
            for reviewing it and deciding whether it is appropriate for your use.
          </p>
        </Section>

        <Section n={7} title="Payments">
          <p>
            Razorpay is used only for the existing iOS and web payment flow. No payment is
            collected in the Android app, Razorpay is not used in the Android app, and Google Play
            billing is not enabled for Android. Any payment terms shown during an eligible iOS or
            web purchase apply to that transaction.
          </p>
        </Section>

        <Section n={8} title="Amazon Affiliate Disclosure and Android Advertising">
          <p>
            The Gear Store contains Amazon affiliate links. SweatReel may earn a commission from
            eligible purchases made through those links, without changing your purchase price.
          </p>
          <p>
            The Android app has no third-party advertising SDK and shows no ads.
          </p>
        </Section>

        <Section n={9} title="Disclaimers and Warranties">
          <p>
            SweatReel and its content are provided on an “as is” and “as available” basis. To the
            extent permitted by applicable law, no additional warranties are made regarding
            availability, accuracy, or fitness for a particular purpose.
          </p>
        </Section>

        <Section n={10} title="Limitation of Liability">
          <p>
            To the extent permitted by applicable law, SweatReel will not be liable for indirect,
            incidental, special, consequential, or punitive damages arising from use of, or
            inability to use, the service.
          </p>
        </Section>

        <Section n={11} title="Changes and Contact">
          <p>
            These Terms may be updated when the service or applicable requirements change. The
            effective date above identifies the current version. Questions can be sent to{" "}
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
    </main>
  );
}