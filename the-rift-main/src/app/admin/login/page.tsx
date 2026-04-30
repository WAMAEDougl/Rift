"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sign in directly via Supabase client — this sets the session cookie
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        setError(authError?.message ?? "Invalid email or password");
        setLoading(false);
        return;
      }

      // Verify the user has admin/kitchen role
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

      // Navigate to admin dashboard
      window.location.replace("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 ink-gradient">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-background/10 border border-background/20 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19C11 19 4.5 14.5 4.5 9C4.5 6.015 7.462 3.5 11 3.5C14.538 3.5 17.5 6.015 17.5 9C17.5 14.5 11 19 11 19Z" fill="#c8a96e" fillOpacity="0.9"/>
              <line x1="11" y1="19" x2="11" y2="11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-background font-display text-lg leading-none">
              Rift &amp; Root
            </p>
            <p className="text-accent/60 text-[10px] uppercase tracking-widest">
              Kenya
            </p>
          </div>
        </div>

        <div>
          <h1 className="font-display text-5xl font-medium text-background leading-tight mb-4">
            Eat Healthy.<br />Enjoy Life.
          </h1>
          <p className="text-background/60 text-lg leading-relaxed max-w-sm">
            Heritage African meals and pantry goods, hand-crafted in small batches in Nairobi.
          </p>
        </div>

        <p className="text-background/30 text-xs">
          Rift &amp; Root &copy; {new Date().getFullYear()} — Internal use only
        </p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 15.5C9 15.5 3.5 11.5 3.5 7C3.5 4.515 6.015 2.5 9 2.5C11.985 2.5 14.5 4.515 14.5 7C14.5 11.5 9 15.5 9 15.5Z" fill="#c8a96e" fillOpacity="0.9"/>
                <line x1="9" y1="15.5" x2="9" y2="9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-display text-foreground font-medium">Rift &amp; Root</p>
          </div>

          <h2 className="font-display text-2xl font-medium text-foreground mb-1">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to your admin account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground/80 mb-1.5"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="admin@riftandroot.com"
                className="h-11"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground/80 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className="h-11 pr-10"
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
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
