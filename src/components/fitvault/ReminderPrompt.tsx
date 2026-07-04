import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import {
  enableReminders,
  markFirstSeen,
  markPrompted,
  msSinceFirstSeen,
  wasPrompted,
} from "@/lib/reminders";
import { toast } from "./Toast";

const DELAY_MS = 3 * 60 * 1000;

export function ReminderPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    markFirstSeen();
    if (wasPrompted()) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;

    const remaining = Math.max(0, DELAY_MS - msSinceFirstSeen());
    const t = setTimeout(() => setVisible(true), remaining);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    markPrompted();
    setVisible(false);
  };

  const enable = async () => {
    const ok = await enableReminders("08:00");
    if (ok) toast.success("Reminders enabled 🔔");
    else toast.show("Permission denied", "error");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-x-0 z-[80] flex justify-center px-4 pointer-events-none"
      style={{ bottom: "88px" }}
    >
      <div className="pointer-events-auto w-full max-w-[400px] rounded-2xl bg-card border border-border p-3 shadow-xl flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
          <Bell size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-white">
            Get daily workout reminders?
          </p>
          <p className="text-[11px] text-text-secondary">
            Never miss a session.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="press-scale text-text-secondary p-1"
          aria-label="Not now"
        >
          <X size={16} />
        </button>
        <button
          onClick={enable}
          className="press-scale h-9 px-3 rounded-xl bg-primary text-white text-[12px] font-semibold"
        >
          Enable
        </button>
      </div>
    </div>
  );
}
