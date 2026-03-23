"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  url: string;
  platform: "youtube" | "facebook" | "instagram" | "tiktok";
  title: string;
  thumbnailUrl?: string;
  className?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function VideoEmbed({
  url,
  platform,
  title,
  thumbnailUrl,
  className = "",
}: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  // YouTube embed
  if (platform === "youtube") {
    const videoId = getYouTubeId(url);
    if (!videoId) {
      return <ExternalVideoLink url={url} title={title} className={className} />;
    }

    const thumb =
      thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    if (!playing) {
      return (
        <button
          onClick={() => setPlaying(true)}
          className={`relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer ${className}`}
          aria-label={`Play video: ${title}`}
        >
          <Image
            src={thumb}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-sm font-medium text-left">{title}</p>
          </div>
        </button>
      );
    }

    return (
      <div className={`relative w-full aspect-video rounded-2xl overflow-hidden ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  // For other platforms, show a styled external link
  return <ExternalVideoLink url={url} title={title} platform={platform} className={className} />;
}

function ExternalVideoLink({
  url,
  title,
  platform,
  className = "",
}: {
  url: string;
  title: string;
  platform?: string;
  className?: string;
}) {
  const platformLabels: Record<string, { label: string; color: string; icon: string }> = {
    facebook: { label: "Watch on Facebook", color: "bg-blue-600 hover:bg-blue-700", icon: "📘" },
    instagram: { label: "Watch on Instagram", color: "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600", icon: "📸" },
    tiktok: { label: "Watch on TikTok", color: "bg-black hover:bg-foreground/90", icon: "🎵" },
    youtube: { label: "Watch on YouTube", color: "bg-red-600 hover:bg-red-700", icon: "▶️" },
  };

  const p = platformLabels[platform || "youtube"] || platformLabels.youtube;

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center ${className}`}>
      <span className="text-5xl mb-4">{p.icon}</span>
      <p className="text-white/80 text-sm mb-4 px-6 text-center">{title}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm transition-all ${p.color}`}
      >
        <Play className="w-4 h-4 fill-white" />
        {p.label}
      </a>
    </div>
  );
}
