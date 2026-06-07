import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div
        className="relative w-full max-w-[430px] min-h-screen bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <main className="pb-24 px-4 pt-4">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
