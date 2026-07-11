import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Your SweatReel Account" },
      {
        name: "description",
        content:
          "Permanently delete your SweatReel account and personal data. Step-by-step instructions and support contact.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Delete Your SweatReel Account" },
      {
        property: "og:description",
        content:
          "How to permanently delete your SweatReel account and associated personal data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sweat-reel.lovable.app/delete-account" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Delete Your SweatReel Account" },
      {
        name: "twitter:description",
        content:
          "How to permanently delete your SweatReel account and associated personal data.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://sweat-reel.lovable.app/delete-account" },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  return (
    <main className="min-h-screen w-full bg-background flex justify-center">
      <div
        className="w-full max-w-[640px] px-5 pb-16"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}
      >
        <nav aria-label="Breadcrumb" className="text-[13px] text-text-secondary">
          <Link to="/" className="hover:text-white">
            Home
          </Link>{" "}
          <span aria-hidden="true">/</span> <span className="text-white">Delete Account</span>
        </nav>

        <h1 className="text-[28px] font-bold text-white mt-4">
          Delete Your SweatReel Account
        </h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-white/85">
          Users can permanently delete their SweatReel account and associated
          personal data. This page explains how to request deletion and what
          data is removed.
        </p>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">
            How to delete your account
          </h2>
          <ol className="mt-3 list-decimal pl-5 text-[14px] leading-[1.7] text-white/85 space-y-1.5">
            <li>Open the SweatReel app.</li>
            <li>
              Go to <span className="text-white font-medium">Profile → Settings → Delete Account</span>.
            </li>
            <li>Confirm deletion.</li>
            <li>
              Your account and associated personal data will be permanently
              deleted.
            </li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">
            Can't access your account?
          </h2>
          <p className="mt-2 text-[14px] leading-[1.65] text-white/85">
            If you're unable to sign in, email us and we'll process the deletion
            on your behalf:
          </p>
          <p className="mt-2 text-[14px]">
            <a
              href="mailto:support@sweatreel.com?subject=Account%20deletion%20request"
              className="text-primary underline underline-offset-4"
            >
              support@sweatreel.com
            </a>
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">What gets deleted</h2>
          <ul className="mt-3 list-disc pl-5 text-[14px] leading-[1.7] text-white/85 space-y-1.5">
            <li>Account information (email, authentication records).</li>
            <li>Saved workout plans and weekly schedules.</li>
            <li>Saved workout videos and links.</li>
            <li>Profile information (name, goal, preferences, body stats).</li>
            <li>All other user-generated data associated with your account.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">Data retention</h2>
          <p className="mt-2 text-[14px] leading-[1.65] text-white/85">
            Any data that must legally be retained (for example, payment or tax
            records required by law) will only be kept for the minimum period
            required by applicable regulations. All other personal data is
            permanently removed.
          </p>
        </section>

        <section className="mt-10 pt-6 border-t border-white/10">
          <h2 className="text-[15px] font-semibold text-white">Related</h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
            <li>
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/" className="text-primary hover:underline">
                Home
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
