import { useState } from "react";
import { X, Minus, Plus as PlusIcon } from "lucide-react";
import { bodyStatsStore, useBodyStats } from "@/lib/body-stats-store";
import { toast } from "./Toast";

function LineChart({ values }: { values: { v: number; label: string }[] }) {
  if (values.length === 0) return null;
  const width = 260;
  const height = 120;
  const pad = 12;
  const nums = values.map((p) => p.v);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const stepX =
    values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((p, i) => {
    const x = pad + i * stepX;
    const y = pad + ((max - p.v) / range) * (height - pad * 2);
    return { x, y, v: p.v, label: p.label };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="Weight trend"
    >
      <path d={path} fill="none" stroke="#4361EE" strokeWidth={2} />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#4361EE" />
          <title>{`${p.label}: ${p.v} kg`}</title>
        </g>
      ))}
    </svg>
  );
}

export function BodyStatsSection() {
  const { entries, loading } = useBodyStats();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // last 7 entries oldest→newest
  const chartData = [...entries]
    .filter((e) => typeof e.weight_kg === "number")
    .slice(0, 7)
    .reverse()
    .map((e) => ({
      v: Number(e.weight_kg),
      label: new Date(e.logged_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  const step = (delta: number) => {
    const cur = parseFloat(weight) || 0;
    const next = Math.max(0, Math.round((cur + delta) * 10) / 10);
    setWeight(String(next));
  };

  async function save() {
    if (saving) return;
    const w = weight ? parseFloat(weight) : null;
    const bf = bodyFat ? parseFloat(bodyFat) : null;
    if (w == null || Number.isNaN(w) || w <= 0) {
      toast.show("Enter a valid weight", "error");
      return;
    }
    setSaving(true);
    try {
      await bodyStatsStore.add({
        weight_kg: w,
        body_fat_pct: bf,
        notes: notes.trim() || null,
      });
      toast.success("Logged 📊");
      setOpen(false);
      setWeight("");
      setBodyFat("");
      setNotes("");
    } catch {
      toast.show("Couldn't save. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">My Progress</h2>
        {entries[0]?.weight_kg != null && (
          <span className="text-[12px] text-text-secondary">
            Latest: {entries[0].weight_kg} kg
          </span>
        )}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="press-scale mt-3 w-full h-12 rounded-xl border-[1.5px] border-primary text-primary font-semibold flex items-center justify-center gap-2"
      >
        Log Today 📊
      </button>

      {chartData.length > 0 && (
        <div className="mt-3 bg-card border border-border rounded-2xl p-4">
          <p className="text-[14px] font-semibold text-white">Weight Trend</p>
          <div className="mt-2">
            <LineChart values={chartData} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
            <span>{chartData[0].label}</span>
            <span>{chartData[chartData.length - 1].label}</span>
          </div>
        </div>
      )}

      {!loading && chartData.length === 0 && (
        <p className="mt-3 text-[12px] text-text-secondary text-center">
          Log your first entry to start tracking your weight trend.
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="w-full max-w-[430px] bg-background rounded-t-3xl border-t border-border">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <h3 className="text-[16px] font-semibold text-white">Log stats</h3>
              <button
                onClick={() => setOpen(false)}
                className="press-scale w-9 h-9 -mr-2 text-white"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Weight (kg)
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => step(-0.5)}
                    className="press-scale w-11 h-11 rounded-xl bg-card border border-border text-white flex items-center justify-center"
                    aria-label="Decrease"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="72.5"
                    className="flex-1 h-11 text-center rounded-xl bg-card border border-border text-white text-[16px] font-semibold outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => step(0.5)}
                    className="press-scale w-11 h-11 rounded-xl bg-card border border-border text-white flex items-center justify-center"
                    aria-label="Increase"
                  >
                    <PlusIcon size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Body fat % (optional)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="18.5"
                  className="mt-2 w-full h-11 px-3 rounded-xl bg-card border border-border text-white text-[14px] outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                  Notes (optional)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={140}
                  placeholder="Felt strong today"
                  className="mt-2 w-full h-11 px-3 rounded-xl bg-card border border-border text-white text-[14px] outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="press-scale w-full h-12 rounded-xl bg-primary text-white font-semibold disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
