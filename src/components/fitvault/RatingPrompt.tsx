import { useState } from "react";
import { X } from "lucide-react";
import { ratingStore, useRatingVisible } from "@/lib/rating-store";

const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.sweatreel.app";
const SUPPORT_EMAIL = "support@sweatreel.com";

export function RatingPrompt() {
  const visible = useRatingVisible();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  if (!visible) return null;

  const close = (permanent: boolean) => {
    if (permanent) ratingStore.markAskedPermanent();
    ratingStore.hide();
    setRating(0);
    setFeedback("");
  };

  const maybeLater = () => {
    ratingStore.bumpMaybeLater();
    ratingStore.hide();
    setRating(0);
    setFeedback("");
  };

  const openPlay = () => {
    window.open(PLAY_URL, "_blank");
    close(true);
  };

  const sendFeedback = () => {
    const subject = encodeURIComponent("SweatReel Feedback");
    const body = encodeURIComponent(feedback);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    close(true);
  };

  const highRating = rating >= 4;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="relative w-full animate-fade-in"
        style={{
          background: "#141420",
          border: "1px solid #252535",
          borderRadius: 20,
          padding: 28,
          maxWidth: 320,
        }}
      >
        <button
          onClick={() => close(true)}
          aria-label="Close"
          className="absolute top-3 right-3 p-1 text-[#8888AA] press-scale"
        >
          <X size={18} />
        </button>

        <div className="text-center" style={{ fontSize: 48 }}>
          ⭐
        </div>

        <h2
          className="text-center text-white"
          style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}
        >
          Enjoying SweatReel?
        </h2>
        <p
          className="text-center"
          style={{ color: "#8888AA", fontSize: 14, marginTop: 8 }}
        >
          You've completed 5 workouts! A quick rating helps other fitness
          lovers find the app 🙏
        </p>

        <div
          className="flex justify-center gap-1"
          style={{ marginTop: 20 }}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= rating;
            return (
              <button
                key={n}
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                className="press-scale transition-transform"
                style={{
                  width: 40,
                  height: 40,
                  fontSize: 32,
                  lineHeight: 1,
                  color: active ? "#FFD166" : "#252535",
                  transform: active ? "scale(1.2)" : "scale(1)",
                  background: "transparent",
                }}
              >
                {active ? "★" : "☆"}
              </button>
            );
          })}
        </div>

        {rating > 0 && (
          <div style={{ marginTop: 20 }}>
            {highRating ? (
              <>
                <p
                  className="text-center text-white"
                  style={{ fontSize: 14, marginBottom: 12 }}
                >
                  Amazing! Take 10 seconds to rate us on Play Store?
                </p>
                <button
                  onClick={openPlay}
                  className="press-scale w-full"
                  style={{
                    background: "#FFD166",
                    color: "#141420",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Rate on Play Store ⭐
                </button>
              </>
            ) : (
              <>
                <p
                  className="text-center text-white"
                  style={{ fontSize: 14, marginBottom: 8 }}
                >
                  We're sorry! What can we improve?
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Your feedback…"
                  className="w-full"
                  style={{
                    background: "#0F0F18",
                    color: "white",
                    border: "1px solid #252535",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 13,
                    resize: "none",
                    outline: "none",
                  }}
                />
                <button
                  onClick={sendFeedback}
                  className="press-scale w-full"
                  style={{
                    marginTop: 10,
                    background: "#4361EE",
                    color: "white",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Send Feedback →
                </button>
              </>
            )}
          </div>
        )}

        <button
          onClick={maybeLater}
          className="w-full press-scale"
          style={{
            marginTop: 16,
            background: "transparent",
            color: "#8888AA",
            fontSize: 13,
            padding: "8px",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
