import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < Math.round(rating) ? "#FFD166" : "transparent"}
          color="#FFD166"
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ProductCard({ p }: { p: GearProduct }) {
  const buy = () => {
    if (typeof window !== "undefined") {
      window.open(p.affiliate_url, "_blank", "noopener,noreferrer");
    }
    toast.show("Opening Amazon... 🛍️", "info");
  };
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
      <div className="aspect-square bg-[#1c1c2c] overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2.5 flex-1 flex flex-col gap-1.5">
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
        <Stars rating={p.rating} />
        <p className="text-[14px] font-semibold text-white">{p.price}</p>
        <button
          onClick={buy}
          className="press-scale mt-1 w-full rounded-lg text-[12px] font-semibold flex items-center justify-center"
          style={{
            height: 36,
            border: "1px solid #FF9900",
            color: "#FF9900",
          }}
        >
          Buy on Amazon →
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
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-xl font-bold text-white">Fitness Gear 🏋️</h1>
          <span className="text-[11px] text-text-secondary">Affiliate store</span>
        </div>
        <p className="text-[12px] text-text-secondary mt-1">
          Products our community trains with
        </p>
      </header>

      <div className="mt-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-min">
          {GEAR_CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="press-scale h-8 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap"
                style={{
                  background: active ? "#4361EE" : "#141420",
                  border: `1px solid ${active ? "#4361EE" : "#252535"}`,
                  color: active ? "#fff" : "#8888AA",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      <p className="mt-8 mb-2 text-center text-[10px] text-text-secondary px-2">
        As an Amazon Associate, SweatReel earns from qualifying purchases.
      </p>
      <ToastHost />
    </AppShell>
  );
}
