import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const wasDismissed = localStorage.getItem("pwa_install_dismissed");
    if (wasDismissed === "true") {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setVisible(false);
      }
    } catch {}
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed left-0 right-0 z-40 px-4" style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}>
      <div className="max-w-[430px] mx-auto rounded-xl bg-card border border-border p-3 flex items-center gap-3 shadow-lg animate-slide-up">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Smartphone size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white">
            Add SweatReel to your home screen
          </p>
          <p className="text-[11px] text-text-secondary">
            Quick access to your workouts
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="press-scale flex-shrink-0 h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="press-scale flex-shrink-0 w-8 h-8 rounded-lg bg-[#252535] text-text-secondary flex items-center justify-center"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
