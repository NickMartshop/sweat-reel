import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";
import { ToastHost, toast } from "@/components/fitvault/Toast";
import {
  GEAR_CATEGORIES,
  GEAR_PRODUCTS,
  type GearCategory,
  type GearProduct,
} from "@/lib/gear-catalog";

export const Route = createFileRoute("/gear")({
  head: () => ({
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
  }),
  component: GearPage,
});

function ProductCard({ p }: { p: GearProduct }) {
  const buy = () => {
    toast.show("Opening Amazon... 🛍️", "info");
    // Small delay reduces popup blocker false positives.
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.open(p.affiliateUrl, "_blank", "noopener,noreferrer");
      }
    }, 150);
  };
  return (
    <div className="rounded-2xl overflow-hidden border border-border" style={{ background: "#141420" }}>
      <div
        className="relative flex items-center justify-center"
        style={{ height: 120, background: p.gradient }}
      >
        <span style={{ fontSize: 56, lineHeight: 1 }}>{p.emoji}</span>
        {p.tag && (
          <span
            className="absolute rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              top: 8,
              right: 8,
              background: "#fff",
              color: p.tagColor ?? "#000",
            }}
          >
            {p.tag}
          </span>
        )}
      </div>
      <div className="p-3">
        <p
          className="text-[13px] font-semibold text-white leading-tight"
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
        <div className="mt-1.5 flex items-center gap-1 text-[12px]" style={{ color: "#FFD166" }}>
          ⭐ {p.rating}
          <span className="text-[11px] text-text-secondary ml-1">
            ({p.reviews})
          </span>
        </div>
        <p className="mt-1 text-[14px] font-semibold text-white">{p.price}</p>
        <button
          onClick={buy}
          className="press-scale mt-2.5 w-full rounded-lg text-[12px] font-semibold flex items-center justify-center"
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
  const products =
    category === "All"
      ? GEAR_PRODUCTS
      : GEAR_PRODUCTS.filter((p) => p.category === category);

  return (
    <AppShell>
      <header>
        <h1 className="text-xl font-bold text-white">Fitness Gear 🛍️</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">
          Tap to shop on Amazon
        </p>
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

      {/* Category filter */}
      <div className="mt-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
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

      {products.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-[14px] text-white font-semibold">
            No {category} gear yet
          </p>
          <p className="mt-1 text-[12px] text-text-secondary">More coming soon</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}

      <ToastHost />
    </AppShell>
  );
}
