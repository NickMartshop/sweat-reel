import { useEffect, useState } from "react";

const ASKED_KEY = "sweatreel_rating_asked";
const COUNT_KEY = "sweatreel_rating_count";

const listeners = new Set<() => void>();
let visible = false;
let armed = false;
const emit = () => listeners.forEach((l) => l());

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

export const ratingStore = {
  isAsked: () => safeGet(ASKED_KEY) === "true",
  markAskedPermanent: () => safeSet(ASKED_KEY, "true"),
  arm: () => {
    armed = true;
  },
  isArmed: () => armed,
  show: () => {
    if (ratingStore.isAsked()) return;
    armed = false;
    visible = true;
    emit();
  },
  hide: () => {
    visible = false;
    emit();
  },
  bumpMaybeLater: () => {
    const n = parseInt(safeGet(COUNT_KEY) ?? "0", 10) + 1;
    safeSet(COUNT_KEY, String(n));
    if (n >= 3) safeSet(ASKED_KEY, "true");
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  getVisible: () => visible,
};

export function useRatingVisible() {
  const [v, setV] = useState(visible);
  useEffect(() => {
    setV(visible);
    return ratingStore.subscribe(() => setV(visible));
  }, []);
  return v;
}
