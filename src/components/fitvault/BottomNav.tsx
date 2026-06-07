import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, BarChart3, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/plans", label: "Plans", Icon: Calendar },
  { to: "/progress", label: "Progress", Icon: BarChart3 },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-card border-t border-border z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4 h-full">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <li key={to} className="relative">
              <Link
                to={to}
                className="flex flex-col items-center justify-center gap-1 h-full w-full"
                style={{ color: active ? "#4361EE" : "#8888AA" }}
              >
                {active && (
                  <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-primary" />
                )}
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
