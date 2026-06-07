import { useSyncExternalStore, useEffect, useState } from "react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; msg: string; kind: ToastKind };

let current: ToastItem | null = null;
const listeners = new Set<() => void>();
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export const toast = {
  show(msg: string, kind: ToastKind = "info") {
    current = { id: nextId++, msg, kind };
    emit();
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      current = null;
      emit();
    }, 3000);
  },
  success: (m: string) => toast.show(m, "success"),
  error: (m: string) => toast.show(m, "error"),
  info: (m: string) => toast.show(m, "info"),
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function getSnapshot() {
  return current;
}

const bgs: Record<ToastKind, string> = {
  success: "#06D6A0",
  error: "#EF476F",
  info: "#4361EE",
};

export function ToastHost() {
  const t = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[100] flex justify-center px-4"
      style={{ bottom: "88px" }}
    >
      <div
        key={t?.id ?? "none"}
        className={
          "pointer-events-auto rounded-xl px-4 py-3 text-[14px] font-semibold text-white shadow-lg transition-all duration-300 " +
          (t ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")
        }
        style={{ background: t ? bgs[t.kind] : "transparent" }}
      >
        {t?.msg ?? ""}
      </div>
    </div>
  );
}
