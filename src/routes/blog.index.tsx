import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "The SweatReel Blog — Make Your Saved Workouts Count" },
      {
        name: "description",
        content:
          "Short, direct guides on turning saved workout reels into a real plan — and finally doing the training you bookmarked.",
      },
      { property: "og:title", content: "The SweatReel Blog — Make Your Saved Workouts Count" },
      {
        property: "og:description",
        content:
          "Short, direct guides on turning saved workout reels into a real plan — and finally doing the training you bookmarked.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sweatreel.com/blog" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The SweatReel Blog — Make Your Saved Workouts Count" },
      {
        name: "twitter:description",
        content:
          "Short, direct guides on turning saved workout reels into a real plan — and finally doing the training you bookmarked.",
      },
    ],
    links: [{ rel: "canonical", href: "https://sweatreel.com/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#0A0A0F" }}>
      <main
        className="w-full max-w-[430px] px-6"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 32px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 48px)",
        }}
      >
        <Link to="/" style={{ color: "#9DB2FF", fontSize: 13, fontWeight: 600 }}>
          ← SweatReel
        </Link>

        <h1 style={{ marginTop: 20, fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
          The SweatReel Blog
        </h1>
        <p style={{ marginTop: 10, fontSize: 15, color: "#8888AA", lineHeight: 1.5 }}>
          Short reads on saved reels, real plans, and actually showing up.
        </p>

        <div className="mt-7 space-y-4">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="press-scale block"
              style={{
                background: "#141420",
                border: "1px solid #252535",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>
                {post.title}
              </h2>
              <p style={{ marginTop: 8, color: "#8888AA", fontSize: 14, lineHeight: 1.5 }}>
                {post.excerpt}
              </p>
              <p style={{ marginTop: 10, color: "#9DB2FF", fontSize: 12, fontWeight: 600 }}>
                Read · {post.readMinutes} min
              </p>
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="press-scale w-full flex items-center justify-center"
          style={{
            marginTop: 32,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg,#4361EE,#7B2FBE)",
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          Stop Losing Workouts →
        </Link>
        <p className="text-center" style={{ marginTop: 12, fontSize: 12, color: "#8888AA" }}>
          Free forever. No credit card.
        </p>
      </main>
    </div>
  );
}
