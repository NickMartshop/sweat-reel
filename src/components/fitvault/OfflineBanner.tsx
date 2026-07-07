import { useEffect, useState } from "react";
import { toast } from "./Toast";

function initialOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function useOnline() {
  const [online, setOnline] = useState<boolean>(initialOnline());
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
