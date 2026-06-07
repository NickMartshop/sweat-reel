import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Moon, Globe, Lock, Star, Share2, ChevronRight, LogOut } from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "FitVault — Profile" },
      { name: "description", content: "Your FitVault account, preferences and support." },
    ],
  }),
  component: ProfilePage,
});

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-card border border-border rounded-2xl p-3 text-center">
      <p className="text-[11px] text-text-secondary font-medium">{label}</p>
      <p className="text-lg font-bold text-white mt-1 leading-none">{value}</p>
    </div>
  );
}

function Row({
  icon,
  label,
  right,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="press-scale w-full flex items-center gap-3 px-4 py-3.5 bg-card text-left"
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="flex-1 text-[14px] text-white">{label}</span>
      {right}
    </button>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className="w-11 h-6 rounded-full relative transition-colors disabled:opacity-60"
      style={{ background: checked ? "#06D6A0" : "#252535" }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ left: checked ? "22px" : "2px" }}
      />
    </button>
  );
}

function ProfilePage() {
  const [notif, setNotif] = useState(true);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "FitVault",
          text: "Your workouts. Organized.",
          url: window.location.origin,
        });
      } catch {
        /* user cancelled */
      }
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center pt-2">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">
          R
        </div>
        <h1 className="mt-3 text-xl font-bold text-white">Rahul</h1>
        <p className="text-[14px] text-text-secondary">rahul@fitvault.app</p>
      </div>

      <div className="flex gap-2 mt-5">
        <StatCard label="Joined" value="Jun 2026" />
        <StatCard label="Workouts" value="0" />
        <StatCard label="Streak" value="0" />
      </div>

      <section className="mt-6">
        <h2 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-1">
          Preferences
        </h2>
        <div className="mt-2 rounded-2xl overflow-hidden border border-border flex flex-col gap-[2px] bg-border">
          <Row
            icon={<Bell size={18} />}
            label="Notifications"
            right={<Toggle checked={notif} onChange={setNotif} />}
          />
          <Row
            icon={<Moon size={18} />}
            label="Dark Mode"
            right={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-text-secondary">Always on</span>
                <Toggle checked disabled />
              </div>
            }
          />
          <Row
            icon={<Globe size={18} />}
            label="Language"
            right={
              <div className="flex items-center gap-1">
                <span className="text-[13px] text-text-secondary">English</span>
                <ChevronRight size={16} className="text-text-secondary" />
              </div>
            }
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-1">
          Support
        </h2>
        <div className="mt-2 rounded-2xl overflow-hidden border border-border flex flex-col gap-[2px] bg-border">
          <Row
            icon={<Lock size={18} />}
            label="Privacy Policy"
            right={<ChevronRight size={16} className="text-text-secondary" />}
          />
          <Row
            icon={<Star size={18} />}
            label="Rate FitVault"
            right={<ChevronRight size={16} className="text-text-secondary" />}
          />
          <Row
            icon={<Share2 size={18} />}
            label="Share App"
            onClick={handleShare}
            right={<ChevronRight size={16} className="text-text-secondary" />}
          />
        </div>
      </section>

      <button
        className="press-scale mt-6 w-full h-12 rounded-xl border border-error text-error font-semibold flex items-center justify-center gap-2"
        style={{ color: "#EF476F", borderColor: "#EF476F" }}
      >
        <LogOut size={18} />
        Log out
      </button>

      <p className="text-center text-[11px] text-text-secondary mt-6">
        FitVault v1.0 · Your workouts. Organized.
      </p>
    </AppShell>
  );
}
