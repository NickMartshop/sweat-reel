import { X } from "lucide-react";

export type RestType = "active" | "full" | "ice" | "cardio";

export const REST_TYPE_META: Record<
  RestType,
  { label: string; emoji: string; sub: string }
> = {
  active: {
    label: "Active Recovery",
    emoji: "🧘",
    sub: "Light yoga or walk",
  },
  full: { label: "Full Rest", emoji: "💤", sub: "Take it easy today" },
  ice: {
    label: "Ice Bath / Recovery",
    emoji: "🧊",
    sub: "Cold plunge or contrast",
  },
  cardio: {
    label: "Light Cardio",
    emoji: "🏃",
    sub: "Easy Z2 for blood flow",
  },
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: RestType) => void;
}

export function RestDayTypeSheet({ open, onClose, onSelect }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-[430px] bg-background rounded-t-3xl border-t border-border">
        <div className="flex items-center justify-between px-4 h-14 border-b border-border">
          <h3 className="text-[16px] font-semibold text-white">
            Rest day type
          </h3>
          <button
            onClick={onClose}
            className="press-scale w-9 h-9 -mr-2 text-white"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <ul className="p-3 space-y-2 pb-6">
          {(Object.entries(REST_TYPE_META) as [RestType, (typeof REST_TYPE_META)[RestType]][]).map(
            ([key, meta]) => (
              <li key={key}>
                <button
                  onClick={() => onSelect(key)}
                  className="press-scale w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border text-left"
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-white">
                      {meta.label}
                    </p>
                    <p className="text-[12px] text-text-secondary">{meta.sub}</p>
                  </div>
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
