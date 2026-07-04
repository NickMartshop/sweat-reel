import { supabase } from "@/integrations/supabase/client";
import { authStore } from "./auth-store";

const PROMPT_KEY = "sweatreel_reminder_prompted";
const SESSION_START_KEY = "sweatreel_first_seen";

export function markPrompted() {
  try {
    localStorage.setItem(PROMPT_KEY, "1");
  } catch {}
}
export function wasPrompted() {
  try {
    return localStorage.getItem(PROMPT_KEY) === "1";
  } catch {
    return false;
  }
}

export function markFirstSeen() {
  try {
    if (!localStorage.getItem(SESSION_START_KEY)) {
      localStorage.setItem(SESSION_START_KEY, String(Date.now()));
    }
  } catch {}
}
export function msSinceFirstSeen(): number {
  try {
    const t = Number(localStorage.getItem(SESSION_START_KEY) || 0);
    return t ? Date.now() - t : 0;
  } catch {
    return 0;
  }
}

export async function enableReminders(time = "08:00") {
  if (typeof Notification === "undefined") return false;
  let perm = Notification.permission;
  if (perm === "default") perm = await Notification.requestPermission();
  if (perm !== "granted") return false;

  const user = authStore.get().user;
  if (user) {
    await supabase
      .from("profiles")
      .update({
        notifications_enabled: true,
        reminder_time: time,
      } as any)
      .eq("id", user.id);
  }
  markPrompted();
  return true;
}

export async function disableReminders() {
  const user = authStore.get().user;
  if (user) {
    await supabase
      .from("profiles")
      .update({ notifications_enabled: false } as any)
      .eq("id", user.id);
  }
}

export async function setReminderTime(time: string) {
  const user = authStore.get().user;
  if (!user) return;
  await supabase
    .from("profiles")
    .update({ reminder_time: time } as any)
    .eq("id", user.id);
}

// In-app reminder loop: while the tab is open, fire a Notification once/day
// at the user's reminder_time.
let started = false;
let lastFiredKey = "";

export function startReminderLoop(
  getConfig: () => { enabled: boolean; time: string | null },
) {
  if (started || typeof window === "undefined") return;
  started = true;
  setInterval(() => {
    const cfg = getConfig();
    if (!cfg.enabled || !cfg.time) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const dayKey = `${now.toDateString()}-${cfg.time}`;
    if (`${hh}:${mm}` !== cfg.time) return;
    if (lastFiredKey === dayKey) return;
    lastFiredKey = dayKey;
    try {
      new Notification("Time to sweat! 💪", {
        body: "Your workout is waiting in SweatReel",
        icon: "/icon-192.png",
      });
    } catch {}
  }, 60000);
}
