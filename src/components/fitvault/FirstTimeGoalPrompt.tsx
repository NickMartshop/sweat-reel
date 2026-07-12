import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { profileStore, type FitnessGoal } from "@/lib/profile-store";
import { useAuth } from "@/lib/auth-store";
import { useProfile } from "@/lib/profile-store";

const KEY = "sweatreel_goal_asked";

const GOAL_OPTIONS: { key: FitnessGoal; label: string; emoji: string }[] = [
  { key: "build", label: "Build Muscle & Strength", emoji: "🏋️" },
  { key: "lose", label: "Lose Weight & Get Lean", emoji: "🔥" },
  { key: "flex", label: "Improve Flexibility & Recovery", emoji: "🧘" },
  { key: "general", label: "General Fitness & Health", emoji: "🏃" },
];

export function FirstTimeGoalPrompt() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FitnessGoal | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || loading) return;
    if (profile?.fitness_goal) return;
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [user, loading, profile?.fitness_goal]);

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setOpen(false);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await profileStore.setFitnessGoal(selected);
    } catch {
      /* non-fatal */
    }
    setSaving(false);
    dismiss();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div
        className="w-full max-w-[430px] rounded-t-3xl border-t border-border p-5 animate-fade-in"
        style={{
          background: "#141420",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-white">One quick question 💪</h2>
            <p className="mt-1 text-[13px] text-text-secondary">
              What's your main goal?
            </p>
          </div>
          <button
            aria-label="Dismiss"
            onClick={dismiss}
            className="press-scale w-8 h-8 flex items-center justify-center text-text-secondary"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {GOAL_OPTIONS.map((opt) => {
            const active = selected === opt.key;
            return (
              <li key={opt.key}>
                <button
                  onClick={() => setSelected(opt.key)}
                  className="press-scale w-full flex items-center gap-3 p-3 rounded-xl text-left"
                  style={{
                    background: "#0A0A0F",
                    border: `2px solid ${active ? "#4361EE" : "#252535"}`,
                  }}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="flex-1 text-[14px] font-medium text-white">
                    {opt.label}
                  </span>
                  {active && <span className="text-primary font-bold">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={save}
          disabled={!selected || saving}
          className="press-scale w-full rounded-xl text-white font-semibold text-[15px] mt-4 disabled:opacity-50"
          style={{ height: 52, background: "#4361EE" }}
        >
          {saving ? "Saving…" : "Save my goal"}
        </button>
      </div>
    </div>
  );
}
