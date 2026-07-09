import { useEffect, useState } from "react";
import { toast } from "./Toast";

export function useOnline() {
  // Start as online on both SSR and first client render to keep HTML
  // stable; flip to offline only after mount to avoid hydration mismatch.
  const [online, setOnline] = useState<boolean>(true);
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      toast.success("Back online ✅");
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return online;
}

export function OfflineBanner({ online }: { online: boolean }) {
  if (online) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#EF476F",
        padding: "10px 16px",
        color: "white",
        fontSize: 12,
        textAlign: "center",
        fontWeight: 500,
      }}
    >
      ⚠️ No internet connection — some features may not work
    </div>
  );
}
