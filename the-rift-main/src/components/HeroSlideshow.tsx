"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSlideshow, INTERVAL_MS } from "@/lib/slideshow-context";

interface HeroSlideshowProps {
  gradient?: "left" | "top" | "none";
  showControls?: boolean;
}

export default function HeroSlideshow({
  gradient = "left",
  showControls = true,
}: HeroSlideshowProps) {
  const { slides, current, paused, fromDB, ready, goTo, setPaused } = useSlideshow();

  const gradientClass =
    gradient === "left"
      ? "bg-gradient-to-r from-ink/90 via-ink/60 to-transparent"
      : gradient === "top"
      ? "bg-gradient-to-t from-ink/90 via-ink/50 to-ink/10"
      : "";

  const activeSlide = slides[current];

  return (
    <div
      className="absolute inset-0 z-0 bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — fade in only after fetch completes */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              width={1600}
              height={900}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      {gradient !== "none" && (
        <div className={`absolute inset-0 ${gradientClass}`} />
      )}

      {/* Per-slide text — homepage only, DB banners only */}
      {fromDB && ready && activeSlide && showControls && (
        <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="max-w-2xl pointer-events-auto">
              {activeSlide.subtitle && (
                <div
                  className="eyebrow block mb-4 [&_*]:inline"
                  style={{ color: activeSlide.subtitleColor ?? "#e8d5a3" }}
                  dangerouslySetInnerHTML={{ __html: activeSlide.subtitle }}
                />
              )}
              {activeSlide.title && (
                <div
                  className="font-display text-5xl sm:text-6xl lg:text-[5.5rem] font-medium leading-[1.0] tracking-tight mb-6 [&_strong]:font-bold [&_em]:italic"
                  style={{ color: activeSlide.titleColor ?? "#ffffff" }}
                  dangerouslySetInnerHTML={{ __html: activeSlide.title }}
                />
              )}
              {activeSlide.description && (
                <div
                  className="text-lg leading-relaxed mb-8 max-w-lg [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5"
                  style={{ color: activeSlide.descriptionColor ?? "rgba(255,255,255,0.7)" }}
                  dangerouslySetInnerHTML={{ __html: activeSlide.description }}
                />
              )}
              {activeSlide.linkUrl && (
                <Link
                  href={activeSlide.linkUrl}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90 shadow-soft"
                >
                  {activeSlide.linkText ?? "Shop Now"} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dot indicators */}
      {showControls && ready && slides.length > 1 && (
        <div className="absolute bottom-8 left-6 z-10 flex items-center gap-2 lg:left-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2 bg-accent"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {showControls && ready && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <div
            key={current}
            className="h-full bg-accent origin-left"
            style={{
              animation: paused
                ? "none"
                : `slideProgress ${INTERVAL_MS}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
