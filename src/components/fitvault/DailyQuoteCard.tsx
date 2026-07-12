import { useEffect, useState } from "react";
import { getDailyQuote, type DailyQuote } from "@/lib/daily-quote";

export function DailyQuoteCard() {
  // Compute on client only to avoid SSR/timezone hydration mismatch.
  const [q, setQ] = useState<DailyQuote | null>(null);
  useEffect(() => {
    setQ(getDailyQuote(new Date()));
  }, []);

  if (!q) return <div style={{ height: 60 }} aria-hidden />;

  return (
    <div
      className="mt-3 flex items-start gap-3"
      style={{
        background: "#141420",
        border: "1px solid #252535",
        borderRadius: 12,
        padding: "12px 16px",
      }}
    >
      <span aria-hidden style={{ fontSize: 18, lineHeight: "18px" }}>💡</span>
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontSize: 13,
            color: "#FFFFFF",
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          "{q.quote}"
        </p>
        <p style={{ fontSize: 11, color: "#8888AA", marginTop: 4 }}>
          — {q.author}
        </p>
      </div>
    </div>
  );
}
