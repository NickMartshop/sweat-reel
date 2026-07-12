import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Search, ShoppingCart, X } from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";
import { ToastHost, toast } from "@/components/fitvault/Toast";
import {
  GEAR_CATEGORIES,
  GEAR_PRODUCTS,
  type GearCategory,
  type GearProduct,
} from "@/lib/gear-catalog";

const AMAZON_SEARCH_URL =
  "https://www.amazon.in/s?k=fitness+equipment&tag=nickinfotech-21";

function parsePrice(price: string) {
  const match = price.match(/₹([\d,]+)/);
  if (!match) return { price: "", currency: "INR" };
  return { price: match[1].replace(/,/g, ""), currency: "INR" };
}

function parseReviews(reviews: string) {
  const num = parseFloat(reviews.replace(/k/, ""));
  if (reviews.includes("k")) return Math.round(num * 1000);
  return parseInt(reviews, 10) || 0;
}

export const Route = createFileRoute("/gear")({
  head: () => {
    const productItems = GEAR_PRODUCTS.map((p) => {
      const { price, currency } = parsePrice(p.price);
      return {
        "@type": "Product" as const,
        name: p.name,
        description: p.subtitle,
        offers: {
          "@type": "Offer" as const,
          price,
          priceCurrency: currency,
          availability: "https://schema.org/InStock",
          url: p.affiliateUrl,
        },
        aggregateRating: {
          "@type": "AggregateRating" as const,
          ratingValue: String(p.rating),
          reviewCount: String(parseReviews(p.reviews)),
        },
      };
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Fitness Gear — SweatReel",
      url: "https://sweat-reel.lovable.app/gear",
      description: "Handpicked fitness gear our community trains with.",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: productItems,
      },
    };

    return {
      meta: [
        { title: "SweatReel — Gear" },
        {
          name: "description",
          content:
            "Fitness gear our community trains with — resistance bands, weights, protein, yoga mats and recovery tools.",
        },
        { property: "og:title", content: "Fitness Gear — SweatReel" },
        {
          property: "og:description",
          content: "Handpicked fitness gear our community trains with.",
        },
        { property: "og:url", content: "https://sweat-reel.lovable.app/gear" },
        { name: "twitter:title", content: "Fitness Gear — SweatReel" },
        {
          name: "twitter:description",
          content: "Handpicked fitness gear our community trains with.",
        },
      ],
      links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/gear" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(structuredData),
        },
      ] as any,
    };
  },
  component: GearPage,
});

function ProductImage({ product }: { product: GearProduct }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!product.imageUrl || imgFailed) {
    return (
      <div
        style={{
          height: 160,
          background: product.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
        }}
      >
        {product.emoji}
      </div>
    );
  }

  return (
    <img
      src={product.imageUrl}
      alt={product.name}
      onError={() => setImgFailed(true)}
      loading="lazy"
      decoding="async"
      style={{
        width: "100%",
        height: 160,
        objectFit: "contain",
        background: "#1A1A2E",
        padding: 8,
      }}
    />
  );
}

function ProductCard({ p }: { p: GearProduct }) {
  const buy = () => {
    toast.show("Opening Amazon... 🛍️", "info");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.open(p.affiliateUrl, "_blank", "noopener,noreferrer");
      }
    }, 150);
  };
  return (
    <div
      className="rounded-2xl overflow-hidden border border-border"
      style={{ background: "#141420" }}
    >
      <div className="relative">
        <ProductImage product={p} />
        {p.isNew && (
          <span
            className="absolute"
            style={{
              top: 0,
              left: 0,
              fontSize: 10,
              fontWeight: 700,
              background: "#06D6A0",
              color: "#0A0A0F",
              padding: "3px 8px",
              borderRadius: "0 0 8px 0",
              zIndex: 2,
            }}
          >
            NEW
          </span>
        )}
        {p.badge && (
          <span
            className="absolute text-[10px] font-bold"
            style={{
              top: p.isNew ? 22 : 0,
              left: 0,
              background: "#EF476F",
              color: "#fff",
              padding: "3px 8px",
              borderRadius: "0 0 8px 0",
            }}
          >
            {p.badge}
          </span>
        )}
        {p.tag && (
          <span
            className="absolute text-[10px] font-bold"
            style={{
              top: 8,
              right: 8,
              background: "#fff",
              color: p.tagColor ?? "#000",
              padding: "3px 10px",
              borderRadius: 50,
            }}
          >
            {p.tag}
          </span>
        )}
      </div>
      <div className="p-3">
        <p
          className="text-[14px] font-semibold text-white leading-tight"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {p.name}
        </p>
        <p className="mt-0.5 text-[11px] text-text-secondary truncate">
          {p.subtitle}
        </p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span
            className="text-[11px] text-text-secondary"
            style={{ textDecoration: "line-through" }}
          >
            {p.mrp}
          </span>
          <span className="text-[16px] font-bold text-white">{p.price}</span>
        </div>
        <div
          className="mt-1 flex items-center gap-1 text-[12px]"
          style={{ color: "#FFD166" }}
        >
          ⭐ {p.rating}
          <span className="text-[12px] text-text-secondary ml-1">
            ({p.reviews} reviews)
          </span>
        </div>
        <button
          onClick={buy}
          aria-label={`Shop ${p.name} on Amazon`}
          className="press-scale mt-2.5 w-full rounded-lg text-[12px] font-bold flex items-center justify-center"
          style={{ height: 38, background: "#FF9900", color: "#000" }}
        >
          Shop on Amazon →
        </button>
      </div>
    </div>
  );
}

function GearPage() {
  const [category, setCategory] = useState<GearCategory | "All">("All");
  const [query, setQuery] = useState("");

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GEAR_PRODUCTS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, query]);

  const openAmazonSearch = () => {
    toast.show("Opening Amazon... 🛍️", "info");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.open(AMAZON_SEARCH_URL, "_blank", "noopener,noreferrer");
      }
    }, 150);
  };

  return (
    <AppShell>
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">🛒 Gear Store</h1>
        <div
          aria-label="Cart"
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            background: "#141420",
            border: "1px solid #252535",
          }}
        >
          <ShoppingCart size={18} color="#fff" />
          <span
            className="absolute text-[10px] font-bold flex items-center justify-center"
            style={{
              top: -2,
              right: -2,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              background: "#EF476F",
              color: "#fff",
              borderRadius: 999,
            }}
          >
            0
          </span>
        </div>
      </header>

      {/* Affiliate disclosure — legally required */}
      <div
        className="mt-3 rounded-xl px-3.5 py-2.5 flex items-start gap-2"
        style={{
          background: "rgba(255,209,102,0.1)",
          border: "1px solid rgba(255,209,102,0.3)",
        }}
      >
        <AlertTriangle size={14} style={{ color: "#FFD166", marginTop: 2 }} />
        <p className="text-[12px] leading-relaxed" style={{ color: "#FFD166" }}>
          Affiliate Disclosure: SweatReel earns a small commission from Amazon
          purchases at no extra cost to you. This supports our free tier.
        </p>
      </div>

      {/* Search bar */}
      <div
        className="mt-3 flex items-center gap-2 rounded-xl px-3"
        style={{
          height: 44,
          background: "#141420",
          border: "1px solid #252535",
        }}
      >
        <Search size={16} color="#8888AA" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search gear..."
          aria-label="Search gear"
          className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder:text-text-secondary"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="press-scale flex items-center justify-center"
          >
            <X size={16} color="#8888AA" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="mt-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-min">
          {GEAR_CATEGORIES.map((c) => {
            const active = c.key === category;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="press-scale h-8 px-3 rounded-full text-[13px] font-semibold whitespace-nowrap"
                style={{
                  background: active ? "#4361EE" : "#141420",
                  border: `1px solid ${active ? "#4361EE" : "#252535"}`,
                  color: active ? "#fff" : "#8888AA",
                }}
              >
                {c.emoji ? `${c.emoji} ` : ""}
                {c.key}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-[12px]" style={{ color: "#8888AA" }}>
        Showing {products.length} product{products.length === 1 ? "" : "s"}
      </p>

      {products.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-[14px] text-white font-semibold">
            {query
              ? `No results for "${query}"`
              : `No ${category} gear yet`}
          </p>
          <p className="mt-1 text-[12px] text-text-secondary">
            {query ? "Try a different search" : "More coming soon"}
          </p>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {/* Bottom Amazon CTA */}
      <div className="mt-8">
        <div style={{ height: 1, background: "#252535" }} />
        <p className="mt-5 text-center text-[14px] text-white">
          Want a specific product?
        </p>
        <button
          onClick={openAmazonSearch}
          aria-label="Search Amazon India"
          className="press-scale mt-3 w-full rounded-lg text-[13px] font-bold flex items-center justify-center"
          style={{
            height: 44,
            background: "transparent",
            border: "1px solid #FF9900",
            color: "#FF9900",
          }}
        >
          Search Amazon India →
        </button>
      </div>

      <ToastHost />
    </AppShell>
  );
}
