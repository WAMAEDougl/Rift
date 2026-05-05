"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSlideshow, INTERVAL_MS } from "@/lib/slideshow-context";
import { useEffect, useState } from "react";

// ── Hero default config (editable by admin) ───────────────────────────────────
interface HeroConfig {
  hero_bg_image_url:    string | null;
  hero_eyebrow:         string | null;
  hero_headline:        string | null;
  hero_headline_accent: string | null;
  hero_description:     string | null;
  hero_cta_text:        string | null;
  hero_cta_url:         string | null;
  hero_cta2_text:       string | null;
  hero_cta2_url:        string | null;
  hero_stat1_value:     string | null;
  hero_stat1_label:     string | null;
  hero_stat1_sub:       string | null;
  hero_stat2_value:     string | null;
  hero_stat2_label:     string | null;
  hero_stat2_sub:       string | null;
  hero_stat3_value:     string | null;
  hero_stat3_label:     string | null;
  hero_stat3_sub:       string | null;
}

const HERO_DEFAULTS: HeroConfig = {
  hero_bg_image_url:    "https://images.unsplash.com/photo-1574484284002-952d92456975?w=1600&q=80&auto=format&fit=crop&crop=top",
  hero_eyebrow:         "Earth-first · Est. 2018",
  hero_headline:        "Where the Rift",
  hero_headline_accent: "feeds the table.",
  hero_description:     "Heritage African cooking, hand-crafted in small batches from the volcanic soils of the Rift Valley. Delivered to your door with care.",
  hero_cta_text:        "Order Now",
  hero_cta_url:         "/shop",
  hero_cta2_text:       "Our Story",
  hero_cta2_url:        "/story",
  hero_stat1_value:     "100%",
  hero_stat1_label:     "Organic Heritage",
  hero_stat1_sub:       "Certified & traceable",
  hero_stat2_value:     "42",
  hero_stat2_label:     "Partner Farms",
  hero_stat2_sub:       "Across the Rift Valley",
  hero_stat3_value:     "6+",
  hero_stat3_label:     "Years Crafting",
  hero_stat3_sub:       "Small-batch, every week",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface HeroSlideshowProps {
  gradient?: "left" | "top" | "none";
  showControls?: boolean;
}

export default function HeroSlideshow({
  gradient = "left",
  showControls = true,
}: HeroSlideshowProps) {
  const { slides, current, paused, fromDB, ready, goTo, setPaused } = useSlideshow();
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(HERO_DEFAULTS);

  // Fetch admin-editable hero config once on mount
  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.config) {
          setHeroConfig((prev) => ({ ...prev, ...data.config }));
        }
      })
      .catch(() => {/* keep defaults */});
  }, []);

  const gradientClass =
    gradient === "left"
      ? "bg-gradient-to-r from-ink/90 via-ink/60 to-transparent"
      : gradient === "top"
      ? "bg-gradient-to-t from-ink/90 via-ink/50 to-ink/10"
      : "";

  const activeSlide = slides[current];
  const showText = fromDB && ready && activeSlide && showControls;

  // ── Loading / default state ──────────────────────────────────────────────────
  if (!ready) {
    const cfg = heroConfig;
    const bgUrl = cfg.hero_bg_image_url;

    const stats = [
      { value: cfg.hero_stat1_value, label: cfg.hero_stat1_label, sub: cfg.hero_stat1_sub },
      { value: cfg.hero_stat2_value, label: cfg.hero_stat2_label, sub: cfg.hero_stat2_sub },
      { value: cfg.hero_stat3_value, label: cfg.hero_stat3_label, sub: cfg.hero_stat3_sub },
    ].filter((s) => s.value && s.label);

    return (
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: "var(--ink)" }}>

        {/* Background image */}
        {bgUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bgUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-top"
              style={{ opacity: 0.28 }}
            />
            {/* Dark gradient over image so text stays legible */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(105deg, color-mix(in oklab, var(--ink) 88%, transparent) 0%, color-mix(in oklab, var(--ink) 55%, transparent) 55%, color-mix(in oklab, var(--ink) 30%, transparent) 100%)",
              }}
            />
          </>
        )}

        {/* Grain texture */}
        <div className="grain absolute inset-0 opacity-[0.12] pointer-events-none" />

        {/* Warm clay glow — bottom-left */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 5% 95%, color-mix(in oklab, var(--clay) 20%, transparent), transparent 68%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">

              {/* ── Left: brand story ── */}
              <div className="max-w-2xl">

                {/* Eyebrow */}
                <div className="flex items-center gap-3">
                  <div
                    className="h-px w-8 shrink-0"
                    style={{ background: "color-mix(in oklab, var(--ochre) 55%, transparent)" }}
                  />
                  <span
                    className="text-[0.67rem] font-semibold uppercase tracking-[0.28em]"
                    style={{ color: "color-mix(in oklab, var(--ochre) 70%, white)" }}
                  >
                    {cfg.hero_eyebrow}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="mt-6 font-display text-5xl font-medium leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]">
                  {cfg.hero_headline}
                  {cfg.hero_headline_accent && (
                    <>
                      <br />
                      <span style={{ color: "var(--ochre)" }}>
                        {cfg.hero_headline_accent}
                      </span>
                    </>
                  )}
                </h1>

                {/* Description */}
                <p
                  className="mt-6 max-w-md text-base leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {cfg.hero_description}
                </p>

                {/* CTAs */}
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  {cfg.hero_cta_url && cfg.hero_cta_text && (
                    <Link
                      href={cfg.hero_cta_url}
                      className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition hover:opacity-90"
                      style={{ background: "var(--clay)", color: "var(--primary-foreground)" }}
                    >
                      {cfg.hero_cta_text} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  {cfg.hero_cta2_url && cfg.hero_cta2_text && (
                    <Link
                      href={cfg.hero_cta2_url}
                      className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
                      style={{ borderColor: "rgba(255,255,255,0.22)" }}
                    >
                      {cfg.hero_cta2_text}
                    </Link>
                  )}
                </div>
              </div>

              {/* ── Right: stat cards (desktop only) ── */}
              {stats.length > 0 && (
                <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:min-w-[210px]">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl px-6 py-5"
                      style={{
                        background: "color-mix(in oklab, white 5%, transparent)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <div className="font-display text-3xl font-medium text-white">
                        {stat.value}
                      </div>
                      <div
                        className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: "color-mix(in oklab, var(--ochre) 80%, white)" }}
                      >
                        {stat.label}
                      </div>
                      {stat.sub && (
                        <div
                          className="mt-1 text-[0.68rem] leading-snug"
                          style={{ color: "rgba(255,255,255,0.36)" }}
                        >
                          {stat.sub}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Loading bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full origin-left"
            style={{
              background: "var(--ochre)",
              opacity: 0.45,
              animation: "heroLoad 2s cubic-bezier(0.4,0,0.2,1) infinite",
            }}
          />
        </div>

        <style>{`
          @keyframes heroLoad {
            0%   { transform: scaleX(0);   transform-origin: left;  }
            48%  { transform: scaleX(1);   transform-origin: left;  }
            52%  { transform: scaleX(1);   transform-origin: right; }
            100% { transform: scaleX(0);   transform-origin: right; }
          }
        `}</style>
      </div>
    );
  }

  // ── Live slideshow ───────────────────────────────────────────────────────────
  return (
    <div
      className="absolute inset-0 z-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — crossfade */}
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

      {/* Gradient overlay */}
      {gradient !== "none" && (
        <div className={`absolute inset-0 ${gradientClass}`} />
      )}

      {/* Per-slide text — DB banners only */}
      {showText && (
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
      {showControls && slides.length > 1 && (
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
      {showControls && (
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
