import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Your SweatReel Account" },
      {
        name: "description",
        content:
          "How to permanently delete your SweatReel account and associated user data.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Delete Your SweatReel Account" },
      {
        property: "og:description",
        content:
          "How to permanently delete your SweatReel account and associated user data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sweatreel.com/delete-account" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Delete Your SweatReel Account" },
      {
        name: "twitter:description",
        content:
          "How to permanently delete your SweatReel account and associated user data.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sweatreel.com/delete-account" }],
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
          <span aria-hidden="true">/</span>{" "}
          <span className="text-white">Delete Account</span>
        </nav>

        <h1 className="text-[28px] font-bold text-white mt-4">
          Delete Your SweatReel Account
        </h1>
        <p className="text-[12px] text-text-secondary mt-1">
          Effective date: September 30, 2026
        </p>
        <p className="mt-3 text-[14px] leading-[1.6] text-white/85">
          You can permanently delete your SweatReel account and associated user data in the app
          or request help by email.
        </p>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">Delete in the app</h2>
          <ol className="mt-3 list-decimal pl-5 text-[14px] leading-[1.7] text-white/85 space-y-1.5">
            <li>Open SweatReel and sign in to the account you want to delete.</li>
            <li>
              Go to <span className="text-white font-medium">Profile → Delete Account</span>.
            </li>
            <li>Review the deletion notice and confirm your request.</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">Request deletion by email</h2>
          <p className="mt-2 text-[14px] leading-[1.65] text-white/85">
            If you cannot access the app, email{" "}
            <a
              href="mailto:support@sweatreel.com?subject=Account%20deletion%20request"
              className="text-primary underline underline-offset-4"
            >
              support@sweatreel.com
            </a>{" "}
            from the email address associated with your account. We may ask for information
            needed to verify account ownership before processing the request. Do not send a
            password.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">What is deleted</h2>
          <ul className="mt-3 list-disc pl-5 text-[14px] leading-[1.7] text-white/85 space-y-1.5">
            <li>Account data, including email, identity information, profile, and name.</li>
            <li>Saved workouts and workout URLs.</li>
            <li>Workout plans and completed workout history.</li>
            <li>Body stats associated with the account.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">Deletion and retention</h2>
          <p className="mt-2 text-[14px] leading-[1.65] text-white/85">
            After ownership is verified and the request is processed, the account and associated
            user data listed above are deleted. Information required to meet an applicable legal
            obligation may be retained only as required by that obligation.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-white">Service disclosures</h2>
          <div className="mt-2 text-[14px] leading-[1.65] text-white/85 space-y-2">
            <p>
              AI extraction uses the OpenAI API through our Supabase Edge Function, transmitting
              the workout title, source URL, platform string, and text necessary for the requested
              extraction. It processes the submitted text context, not the actual video stream,
              and does not download the video or upload video or audio frames. Account passwords,
              session tokens, and provider API credentials are not sent to OpenAI. See our{" "}
              <Link to="/privacy" className="text-primary underline underline-offset-4">
                Privacy Policy
              </Link>{" "}
              for the AI provider disclosure and links to OpenAI's current privacy and API terms.
              Public YouTube metadata is obtained through server-side YouTube oEmbed;
              SweatReel does not download or host YouTube videos.
            </p>
            <p>
              The Gear Store contains Amazon affiliate links, and SweatReel may earn a commission
              from eligible purchases. The Android app has no third-party advertising SDK and
              shows no ads.
            </p>
            <p>
              Razorpay is used only for the existing iOS and web payment flow. No payment is
              collected through Razorpay in the Android app, and Google Play billing is not
              enabled for Android.
            </p>
          </div>
        </section>

        <section className="mt-10 pt-6 border-t border-white/10">
          <h2 className="text-[15px] font-semibold text-white">Related policies</h2>
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