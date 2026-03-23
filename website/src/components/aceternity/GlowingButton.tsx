"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface GlowingButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "whatsapp";
  className?: string;
  external?: boolean;
}

const variants = {
  primary: {
    bg: "bg-primary",
    glow: "shadow-primary/30",
    hover: "hover:shadow-primary/50",
    text: "text-white",
  },
  secondary: {
    bg: "bg-secondary",
    glow: "shadow-secondary/30",
    hover: "hover:shadow-secondary/50",
    text: "text-white",
  },
  whatsapp: {
    bg: "bg-green-600",
    glow: "shadow-green-600/30",
    hover: "hover:shadow-green-600/50",
    text: "text-white",
  },
};

export default function GlowingButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  external,
}: GlowingButtonProps) {
  const v = variants[variant];
  const classes = `inline-flex items-center justify-center gap-2 ${v.bg} ${v.text} px-8 py-3.5 rounded-xl font-bold text-base shadow-lg ${v.glow} ${v.hover} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
