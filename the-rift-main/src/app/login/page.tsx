"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/admin/supabase";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/orders";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setError(`Too many failed attempts. Please wait 30 seconds before trying again.`);
      } else {
        setError(`${authError.message} (${next}/${MAX_ATTEMPTS} attempts)`);
      }
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  const isLocked = countdown > 0;

  const inputCls =
    "w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm placeholder:text-muted-foreground/50";

  return (
    <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || isLocked}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-soft"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
            </>
          ) : isLocked ? (
            <>Retry in {countdown}s</>
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-primary font-medium hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="text-primary font-medium hover:underline">
          Create account
        </Link>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/orders/track" className="text-primary font-medium hover:underline">
            Track your order
          </Link>{" "}
          without signing in.
        </p>
      </div>
    </div>
  );
}

async function getStoreName(): Promise<string> {
  try {
    const admin = getAdminClient();
    const { data } = await admin
      .from("store_settings")
      .select("store_name")
      .eq("id", 1)
      .single();
    return data?.store_name || "Rift & Root";
  } catch {
    return "Rift & Root";
  }
}

export default async function LoginPage() {
  const storeName = await getStoreName();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ background: "#1c1917" }}
            >
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C11 19 4.5 14.5 4.5 9C4.5 6.015 7.462 3.5 11 3.5C14.538 3.5 17.5 6.015 17.5 9C17.5 14.5 11 19 11 19Z" fill="#c8a96e" fillOpacity="0.9"/>
                <line x1="11" y1="19" x2="11" y2="11" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="font-display text-xl tracking-tight text-foreground">
              {storeName}
            </span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-medium text-foreground">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View your order history and track deliveries
          </p>
        </div>

        <Suspense fallback={<div className="bg-card rounded-2xl border border-border p-8 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to {storeName}
          </Link>
        </p>
      </div>
    </div>
  );
}
