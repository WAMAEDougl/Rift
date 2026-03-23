"use client";

import { useState } from "react";
import { Mail, Check, ArrowRight } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "inline" | "card";
  className?: string;
}

export default function NewsletterSignup({
  variant = "card",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // For now, open WhatsApp with the email — will be replaced with real email service in Phase 3
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40"
          />
        </div>
        <button
          type="submit"
          disabled={submitted}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            submitted
              ? "bg-green-500 text-white"
              : "bg-card text-primary hover:bg-card/90"
          }`}
        >
          {submitted ? (
            <Check className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </form>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
          Newsletter
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">
        Join 2,000+ Kenyans Eating Healthier
      </h3>
      <p className="text-white/70 text-sm mb-5">
        Get weekly recipes, health tips, and exclusive offers. Plus a free gut
        health guide when you sign up.
      </p>

      {submitted ? (
        <div className="flex items-center gap-2 bg-green-500/20 rounded-xl p-4">
          <Check className="w-5 h-5 text-green-300" />
          <span className="text-sm font-medium">
            Welcome to the Ayola community! Check your inbox.
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-card text-primary py-3.5 rounded-xl font-bold hover:bg-card/90 transition-colors"
          >
            Get Free Gut Health Guide
          </button>
          <p className="text-[11px] text-white/40 text-center">
            No spam. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}
