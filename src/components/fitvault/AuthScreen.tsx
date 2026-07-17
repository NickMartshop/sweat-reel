import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authStore } from "@/lib/auth-store";
import { toast } from "./Toast";

type Mode = "signup" | "signin";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function friendlyAuthError(msg: string | undefined, status?: number): string {
  if (!msg) return "Something went wrong. Please try again.";
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password";
  if (m.includes("already registered") || m.includes("already exists"))
    return "An account with this email already exists";
  if (m.includes("signup") && m.includes("disabled"))
    return "Sign ups are temporarily disabled. Please contact support.";
  if (m.includes("email") && m.includes("rate"))
    return "Too many email attempts. Please wait and try again.";
  if (m.includes("api key") || m.includes("invalid key") || status === 401)
    return "Authentication is not configured correctly. Please contact support.";
  if (m.includes("not allowed") || m.includes("redirect"))
    return "This sign-in link isn't allowed yet. Please contact support.";
  if (m.includes("password")) return "Password doesn't meet requirements";
  if (m.includes("network") || m.includes("fetch"))
    return "Connection error. Check your internet.";
  return "Something went wrong. Please try again.";
}

function logAuthFailure(action: Mode, err: any) {
  console.warn("Auth failed", {
    action,
    code: err?.code ?? null,
    status: err?.status ?? null,
    name: err?.name ?? null,
    message: typeof err?.message === "string" ? err.message.slice(0, 160) : null,
  });
}

const SIGNUP_WINDOW_MS = 60_000;
const SIGNUP_MAX = 5;

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
  const [signUpLocked, setSignUpLocked] = useState(false);
  const signUpAttempts = useRef<number[]>([]);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read the mode requested from onboarding once on mount.
  useEffect(() => {
    try {
      const m = sessionStorage.getItem("sweatreel_auth_mode");
      if (m === "signin" || m === "signup") setMode(m);
      sessionStorage.removeItem("sweatreel_auth_mode");
    } catch {}
    return () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
    };
  }, []);

  function registerSignupAttempt(): boolean {
    const now = Date.now();
    signUpAttempts.current = signUpAttempts.current.filter(
      (t) => now - t < SIGNUP_WINDOW_MS,
    );
    signUpAttempts.current.push(now);
    if (signUpAttempts.current.length >= SIGNUP_MAX) {
      setSignUpLocked(true);
      toast.show("Too many attempts. Wait 60 seconds.", "error");
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
      unlockTimer.current = setTimeout(() => {
        signUpAttempts.current = [];
        setSignUpLocked(false);
      }, SIGNUP_WINDOW_MS);
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && signUpLocked) return;
    const errs: Record<string, string> = {};
    if (mode === "signup" && name.trim().length < 2)
      errs.name = "Please enter your name";
    if (!isEmail(email)) errs.email = "Invalid email";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (mode === "signup" && password !== confirm)
      errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (mode === "signup" && !registerSignupAttempt()) return;

    setSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { name: name.trim() },
          },
        });
        if (error) throw error;
        await authStore.refresh();
        if (!data.session) {
          toast.show("Account created. Check your email to confirm sign in.", "success");
          setMode("signin");
          setPassword("");
          setConfirm("");
          return;
        }
        toast.show("Welcome to SweatReel! 💪", "success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        await authStore.refresh();
        toast.show("Welcome back!", "success");
      }
      navigate({ to: "/" });
    } catch (err: any) {
      logAuthFailure(mode, err);
      toast.show(friendlyAuthError(err?.message, err?.status), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls =
    "w-full h-[52px] px-4 rounded-xl bg-card border border-border text-[15px] text-white placeholder:text-text-secondary outline-none focus:border-primary transition-colors";

  const submitDisabled =
    submitting || (mode === "signup" && signUpLocked);

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div
        className="w-full max-w-[430px] px-6 py-10 flex flex-col"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 40px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "env(keyboard-inset-height, 300px)",
        }}
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

        {/* Free tier badge */}
        <div
          className="mt-6 text-center"
          style={{
            background: "rgba(6,214,160,0.1)",
            border: "1px solid rgba(6,214,160,0.3)",
            color: "#06D6A0",
            fontSize: 12,
            padding: "8px 16px",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          ✅ Free to use — no credit card needed
        </div>

        <div className="grid grid-cols-2 bg-card rounded-[50px] p-1 h-11">
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
                type={showPw ? "text" : "password"}
                className={fieldCls + " pr-12"}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
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
                  aria-label={showConf ? "Hide password" : "Show password"}
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
            disabled={submitDisabled}
            className="press-scale w-full rounded-xl bg-primary text-white font-semibold text-[16px] mt-5 disabled:opacity-60"
            style={{ height: 56 }}
          >
            {submitting
              ? "Please wait…"
              : mode === "signup" && signUpLocked
                ? "Locked — wait 60s"
                : mode === "signup"
                  ? "Create Account"
                  : "Sign In"}
          </button>

          {mode === "signup" && (
            <p
              className="text-center pt-2"
              style={{ fontSize: 11, color: "#8888AA" }}
            >
              By signing up you agree to our{" "}
              <Link
                to="/privacy"
                className="px-1"
                style={{ color: "#4361EE" }}
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                to="/terms"
                className="px-1"
                style={{ color: "#4361EE" }}
              >
                Terms of Service
              </Link>
              .
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
