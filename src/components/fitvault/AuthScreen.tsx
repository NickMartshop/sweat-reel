import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { authStore } from "@/lib/auth-store";
import { toast } from "./Toast";

type Mode = "signup" | "signin";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === "signup" && name.trim().length < 2) errs.name = "Please enter your name";
    if (!isEmail(email)) errs.email = "Invalid email";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (mode === "signup" && password !== confirm) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    authStore.signIn({
      name: mode === "signup" ? name.trim() : email.split("@")[0],
      email: email.trim(),
    });
    toast.show(mode === "signup" ? "Welcome to FitVault! 💪" : "Welcome back!", "success");
  };

  const fieldCls =
    "w-full h-[52px] px-4 rounded-xl bg-card border border-border text-[15px] text-white placeholder:text-text-secondary outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div
        className="w-full max-w-[430px] px-6 py-10 flex flex-col"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 40px)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-2xl font-bold">FV</span>
          </div>
          <h1 className="mt-3 text-[28px] font-bold text-white">FitVault</h1>
          <p className="text-[14px] text-text-secondary mt-1">Your workouts. Organized.</p>
        </div>

        {/* Toggle */}
        <div className="mt-8 grid grid-cols-2 bg-card rounded-[50px] p-1 h-11">
          {(["signup", "signin"] as const).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErrors({});
                }}
                className="rounded-[50px] text-[14px] font-semibold transition-colors"
                style={{
                  background: active ? "#4361EE" : "transparent",
                  color: active ? "#fff" : "#8888AA",
                }}
              >
                {m === "signup" ? "Sign Up" : "Sign In"}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className={fieldCls}
              />
              {errors.name && <p className="text-[12px] text-error mt-1 px-1">{errors.name}</p>}
            </div>
          )}
          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              autoComplete="email"
              className={fieldCls}
            />
            {errors.email && <p className="text-[12px] text-error mt-1 px-1">{errors.email}</p>}
          </div>
          <div>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create password" : "Password"}
                type={showPw ? "text" : "password"}
                className={fieldCls + " pr-12"}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary p-2"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[12px] text-error mt-1 px-1">{errors.password}</p>
            )}
          </div>

          {mode === "signup" ? (
            <div>
              <div className="relative">
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  type={showConf ? "text" : "password"}
                  className={fieldCls + " pr-12"}
                />
                <button
                  type="button"
                  onClick={() => setShowConf((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary p-2"
                >
                  {showConf ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-[12px] text-error mt-1 px-1">{errors.confirm}</p>
              )}
            </div>
          ) : (
            <div className="flex justify-end">
              <button type="button" className="text-[12px] text-primary font-semibold">
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="press-scale w-full rounded-xl bg-primary text-white font-semibold text-[16px] mt-5"
            style={{ height: 56 }}
          >
            {mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          {mode === "signup" && (
            <p className="text-[11px] text-text-secondary text-center pt-2">
              By signing up you agree to our{" "}
              <Link to="/privacy" className="text-primary">
                Privacy Policy
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
