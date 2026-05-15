"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!lockedUntil) { setCountdown(0); return; }
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) { setCountdown(0); setLockedUntil(null); setFailedAttempts(0); }
      else setCountdown(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = countdown > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setError(`Too many failed attempts. Please wait ${remaining} seconds.`);
        return;
      }
      setLockedUntil(null);
      setFailedAttempts(0);
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError || !data.user) {
        const next = failedAttempts + 1;
        setFailedAttempts(next);
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS);
          setError(`Too many failed attempts. Please wait 60 seconds before trying again.`);
        } else {
          setError(`${authError?.message ?? "Invalid email or password"} (${next}/${MAX_ATTEMPTS} attempts)`);
        }
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile || !["admin", "kitchen"].includes((profile as { role: string }).role)) {
        await supabase.auth.signOut();
        setError("Access denied. Admin or kitchen role required.");
        setLoading(false);
        return;
      }

      window.location.replace("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left — brand panel (always dark, theme-independent) ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1c1917 0%, #292524 60%, #1c1917 100%)" }}
      >
        {/* Subtle grain texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

        {/* Warm clay glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 15% 90%, rgba(200,169,110,0.12), transparent 65%)" }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19C11 19 4.5 14.5 4.5 9C4.5 6.015 7.462 3.5 11 3.5C14.538 3.5 17.5 6.015 17.5 9C17.5 14.5 11 19 11 19Z" fill="#c8a96e" fillOpacity="0.9"/>
              <line x1="11" y1="19" x2="11" y2="11" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="font-display text-lg leading-none" style={{ color: "rgba(255,255,255,0.92)" }}>
              Rift &amp; Root
            </p>
            <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "#c8a96e", opacity: 0.65 }}>
              Kenya
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative">
          <h1 className="font-display text-5xl font-medium leading-tight mb-5"
            style={{ color: "rgba(255,255,255,0.93)" }}>
            Eat Healthy.<br />Enjoy Life.
          </h1>
          <p className="text-lg leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Heritage African meals and pantry goods, hand-crafted in small batches in Nairobi.
          </p>

          {/* Decorative accent line */}
          <div className="mt-10 h-px w-16" style={{ background: "rgba(200,169,110,0.4)" }} />
        </div>

        <p className="relative text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
          Rift &amp; Root &copy; {new Date().getFullYear()} — Internal use only
        </p>
      </div>

      {/* ── Right — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/20 dark:bg-background">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#1c1917" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 15.5C9 15.5 3.5 11.5 3.5 7C3.5 4.515 6.015 2.5 9 2.5C11.985 2.5 14.5 4.515 14.5 7C14.5 11.5 9 15.5 9 15.5Z" fill="#c8a96e" fillOpacity="0.9"/>
                <line x1="9" y1="15.5" x2="9" y2="9" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-display text-foreground font-medium text-lg">Rift &amp; Root</p>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-2xl font-medium text-foreground mb-1">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm mb-7">
              Sign in to your admin account
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || isLocked}
                  placeholder="admin@riftandroot.com"
                  className="h-11 bg-background"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || isLocked}
                    placeholder="••••••••"
                    className="h-11 pr-10 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || isLocked}
                className="w-full h-11 mt-1 rounded-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                  </span>
                ) : isLocked ? (
                  `Retry in ${countdown}s`
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-5">
            Internal staff access only
          </p>
        </div>
      </div>
    </div>
  );
}
