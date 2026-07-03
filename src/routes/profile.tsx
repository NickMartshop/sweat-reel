import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  Moon,
  Globe,
  Lock,
  Star,
  Share2,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { AppShell } from "@/components/fitvault/AppShell";
import { ToastHost, toast } from "@/components/fitvault/Toast";
import { useProfile } from "@/lib/profile-store";
import { authStore } from "@/lib/auth-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "SweatReel — Profile" },
      {
        name: "description",
        content: "Manage your SweatReel account, set your preferences, and access support for your fitness journey.",
      },
      { property: "og:title", content: "My Profile — SweatReel" },
      { property: "og:description", content: "Manage your account, notification preferences and app settings on SweatReel." },
      { property: "og:url", content: "https://sweat-reel.lovable.app/profile" },
      { name: "twitter:title", content: "My Profile — SweatReel" },
      { name: "twitter:description", content: "Manage your account, notification preferences and app settings on SweatReel." },
    ],
    links: [{ rel: "canonical", href: "https://sweat-reel.lovable.app/profile" }],
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

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "Disable setting" : "Enable setting"}
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
  const { profile } = useProfile();
  const navigate = useNavigate();

  const name = profile?.name || "Athlete";
  const email = profile?.email || "";
  const initial = name.charAt(0).toUpperCase();
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "SweatReel",
          text: "Your workouts. Organized.",
          url: window.location.origin,
        });
      } catch {
        /* user cancelled */
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authStore.signOut();
      toast.show("Signed out", "info");
      navigate({ to: "/auth" });
    } catch {
      toast.show("Couldn't sign out. Try again.", "error");
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center pt-2">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">
          {initial}
        </div>
        <h1 className="mt-3 text-xl font-bold text-white">{name}&apos;s Profile</h1>
        <p className="text-[14px] text-text-secondary">{email}</p>
      </div>

      <div className="flex gap-2 mt-5">
        <StatCard label="Joined" value={joined} />
        <StatCard label="Workouts" value={String(profile?.total_workouts ?? 0)} />
        <StatCard label="Streak" value={String(profile?.streak_count ?? 0)} />
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
          <Link to="/privacy" className="block">
            <Row
              icon={<Lock size={18} />}
              label="Privacy Policy"
              right={<ChevronRight size={16} className="text-text-secondary" />}
            />
          </Link>
          <Row
            icon={<Star size={18} />}
            label="Rate SweatReel"
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
        onClick={handleLogout}
        className="press-scale mt-6 w-full h-12 rounded-xl border font-semibold flex items-center justify-center gap-2"
        style={{ color: "#EF476F", borderColor: "#EF476F" }}
      >
        <LogOut size={18} />
        Log out
      </button>

      <p className="text-center text-[11px] text-text-secondary mt-6">
        SweatReel v1.0.0 · Your workouts. Organized.
      </p>
      <ToastHost />
    </AppShell>
  );
}
