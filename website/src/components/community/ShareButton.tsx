"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text?: string;
  className?: string;
}

export default function ShareButton({ title, text, className = "" }: ShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title,
      text: text || title,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error — fallback to WhatsApp
        fallbackShare(shareData);
      }
    } else {
      fallbackShare(shareData);
    }
  };

  const fallbackShare = (data: { title: string; url: string }) => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(
      `${data.title} — Ayola Foods Kenya\n${data.url}`
    )}`;
    window.open(waUrl, "_blank");
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors ${className}`}
    >
      <Share2 className="w-4 h-4" />
      Share
    </button>
  );
}
