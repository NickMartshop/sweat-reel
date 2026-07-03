import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./Toast";

type Mode = "signup" | "signin";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function friendlyAuthError(msg: string | undefined): string {
  if (!msg) return "Something went wrong. Try again.";
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password";
  if (m.includes("already registered") || m.includes("already exists"))
    return "An account with this email already exists";
  if (m.includes("password")) return "Password doesn't meet requirements";
  if (m.includes("network") || m.includes("fetch"))
    return "Connection error. Check your internet.";
  return "Something went wrong. Try again.";
}

export function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === "signup" && name.trim().length < 2)
      errs.name = "Please enter your name";
    if (!isEmail(email)) errs.email = "Invalid email";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (mode === "signup" && password !== confirm)
      errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name.trim() },
          },
        });
        if (error) throw error;
        toast.show("Welcome to SweatReel! 💪", "success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.show("Welcome back!", "success");
      }
      navigate({ to: "/" });
    } catch (err: any) {
      toast.show(friendlyAuthError(err?.message), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls =
    "w-full h-[52px] px-4 rounded-xl bg-card border border-border text-[15px] text-white placeholder:text-text-secondary outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div
        className="w-full max-w-[430px] px-6 py-10 flex flex-col"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 40px)" }}
      >
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-2xl font-bold">SR</span>
          </div>
          <h1 className="mt-3 text-[28px] font-bold text-white">SweatReel — Your Organized Workout Library</h1>
          <p className="text-[14px] text-text-secondary mt-1">
            Your workouts. Organized.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 bg-card rounded-[50px] p-1 h-11">
          {(["signup", "signin"] as const).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
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
                aria-label="Your name"
                className={fieldCls}
              />
              {errors.name && (
                <p className="text-[12px] text-error mt-1 px-1">{errors.name}</p>
              )}
            </div>
          )}
          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              type="email"
              autoComplete="email"
              className={fieldCls}
            />
            {errors.email && (
              <p className="text-[12px] text-error mt-1 px-1">{errors.email}</p>
            )}
          </div>
          <div>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create password" : "Password"}
                aria-label={mode === "signup" ? "Create password" : "Password"}
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
                  aria-label="Confirm password"
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
            disabled={submitting}
            className="press-scale w-full rounded-xl bg-primary text-white font-semibold text-[16px] mt-5 disabled:opacity-60"
            style={{ height: 56 }}
          >
            {submitting
              ? "Please wait…"
              : mode === "signup"
                ? "Create Account"
                : "Sign In"}
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
