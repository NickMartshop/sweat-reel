import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPost, BLOG_POSTS } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const url = `https://sweatreel.com/blog/${params.slug}`;
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — SweatReel" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: post.metaTitle },
        { name: "description", content: post.metaDescription },
        { property: "og:title", content: post.metaTitle },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.metaTitle },
        { name: "twitter:description", content: post.metaDescription },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.metaDescription,
            datePublished: post.date,
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: "SweatReel", url: "https://sweatreel.com" },
            publisher: { "@type": "Organization", name: "SweatReel", url: "https://sweatreel.com" },
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
  notFoundComponent: PostNotFound,
});

function PostNotFound() {
  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#0A0A0F" }}>
      <main className="w-full max-w-[430px] px-6 pt-24 text-center">
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>Post not found</h1>
        <p style={{ marginTop: 10, color: "#8888AA", fontSize: 15 }}>
          That article doesn't exist — or it moved.
        </p>
        <Link to="/blog" style={{ display: "inline-block", marginTop: 20, color: "#9DB2FF", fontWeight: 600 }}>
          Back to the blog
        </Link>
      </main>
    </div>
  );
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug);

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#0A0A0F" }}>
      <main
        className="w-full max-w-[430px] px-6"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 32px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 48px)",
        }}
      >
        <Link to="/blog" style={{ color: "#9DB2FF", fontSize: 13, fontWeight: 600 }}>
          ← All posts
        </Link>

        <h1 style={{ marginTop: 18, fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
          {post.title}
        </h1>
        <p style={{ marginTop: 8, color: "#8888AA", fontSize: 12 }}>{post.readMinutes} min read</p>

        <article className="mt-6">
          {post.body.map((block, i) => {
            if (block.type === "h2")
              return (
                <h2
                  key={i}
                  style={{ marginTop: 26, color: "#fff", fontSize: 19, fontWeight: 700, lineHeight: 1.3 }}
                >
                  {block.text}
                </h2>
              );
            if (block.type === "p")
              return (
                <p key={i} style={{ marginTop: 14, color: "#C9C9DD", fontSize: 15, lineHeight: 1.6 }}>
                  {block.text}
                </p>
              );
            if (block.type === "ol")
              return (
                <ol key={i} className="mt-4 space-y-3" style={{ counterReset: "step" }}>
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <span
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          background: "#141420",
                          border: "1px solid #252535",
                          color: "#9DB2FF",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {j + 1}
                      </span>
                      <span style={{ color: "#C9C9DD", fontSize: 15, lineHeight: 1.55 }}>{item}</span>
                    </li>
                  ))}
                </ol>
              );
            return (
              <ul key={i} className="mt-4 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span style={{ color: "#06D6A0", fontSize: 15, lineHeight: 1.55 }}>•</span>
                    <span style={{ color: "#C9C9DD", fontSize: 15, lineHeight: 1.55 }}>{item}</span>
                  </li>
                ))}
              </ul>
            );
          })}
        </article>

        <div
          style={{
            marginTop: 32,
            background: "#141420",
            border: "1px solid #252535",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>
            Turn your saved reels into a plan
          </h2>
          <p style={{ marginTop: 8, color: "#8888AA", fontSize: 14, lineHeight: 1.5 }}>
            Paste a link, get the exercises, put it on a day. Start free on{" "}
            <Link to="/" style={{ color: "#9DB2FF", fontWeight: 600 }}>
              the SweatReel home page
            </Link>
            .
          </p>
          <Link
            to="/"
            className="press-scale w-full flex items-center justify-center"
            style={{
              marginTop: 16,
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
        </div>

        <h2 style={{ marginTop: 32, color: "#fff", fontSize: 16, fontWeight: 700 }}>Keep reading</h2>
        <div className="mt-3 space-y-3">
          {others.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="block"
              style={{
                background: "#141420",
                border: "1px solid #252535",
                borderRadius: 14,
                padding: 14,
                color: "#C9C9DD",
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              {p.title}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
