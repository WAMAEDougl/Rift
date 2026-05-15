"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, User, Check, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("Rift & Root");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((json) => { if (json.config?.store_name) setStoreName(json.config.store_name); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/orders`,
      },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setDone(true);
  };

  const inputCls =
    "w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm placeholder:text-muted-foreground/50";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: "#1c1917" }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C11 19 4.5 14.5 4.5 9C4.5 6.015 7.462 3.5 11 3.5C14.538 3.5 17.5 6.015 17.5 9C17.5 14.5 11 19 11 19Z" fill="#c8a96e" fillOpacity="0.9"/>
                <line x1="11" y1="19" x2="11" y2="11" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="font-display text-xl tracking-tight text-foreground">{storeName}</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-medium text-foreground">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track your orders and save your details.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-secondary" />
              </div>
              <p className="font-medium text-foreground">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              </p>
              <Link href="/login" className="block text-sm text-primary font-medium hover:underline mt-2">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  autoComplete="name"
                />
              </div>
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
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  autoComplete="new-password"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`${inputCls} ${confirm && confirm !== password ? "border-destructive focus:border-destructive focus:ring-destructive" : ""}`}
                  autoComplete="new-password"
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-destructive mt-1 ml-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-soft"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
