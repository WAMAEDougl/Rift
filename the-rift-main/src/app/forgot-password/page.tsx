"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [storeName, setStoreName] = useState("Rift & Root");

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((json) => { if (json.config?.store_name) setStoreName(json.config.store_name); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/reset-password`,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
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
          <h1 className="mt-6 font-display text-2xl font-medium text-foreground">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-secondary" />
              </div>
              <p className="font-medium text-foreground">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.
              </p>
              <Link href="/login" className="block text-sm text-primary font-medium hover:underline mt-2">
                Back to sign in
              </Link>
            </div>
          ) : (
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

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-soft"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
