import { useState } from "react";
import { authStore } from "@/lib/auth-store";
import { profileStore } from "@/lib/profile-store";
import { toast } from "./Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}

export function DeleteAccountDialog({ open, onClose, onDone }: Props) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    try {
      // Delete owned rows via RLS (auth.users itself cannot be removed client-side).
      await profileStore.purgeOwnedData();
      await authStore.signOut();
      toast.show(
        "Account deletion requested — email support@sweatreel.com to complete",
        "info",
      );
      onDone?.();
    } catch {
      toast.show("Couldn't process deletion. Try again.", "error");
    } finally {
      setBusy(false);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-[360px] rounded-2xl bg-card border border-border p-5">
        <h3 className="text-[16px] font-semibold text-white">Delete account?</h3>
        <p className="mt-2 text-[13px] text-text-secondary leading-relaxed">
          This will permanently delete all your workouts, plans, and data. This
          cannot be undone.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="press-scale flex-1 h-11 rounded-xl bg-[#252535] text-white font-semibold text-[13px]"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="press-scale flex-1 h-11 rounded-xl text-white font-semibold text-[13px] disabled:opacity-70"
            style={{ background: "#EF476F" }}
          >
            {busy ? "Deleting..." : "Delete Forever"}
          </button>
        </div>
      </div>
    </div>
  );
}
