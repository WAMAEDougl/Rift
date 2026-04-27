"use client";

import { useSlideshow, INTERVAL_MS } from "@/lib/slideshow-context";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1600&q=80&auto=format&fit=crop",
    alt: "Steaming clay pot of heritage African stew on a rustic wooden table",
  },
  {
    src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80&auto=format&fit=crop",
    alt: "Vibrant African spices and grains arranged on a market stall",
  },
  {
    src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1600&q=80&auto=format&fit=crop",
    alt: "Fresh vegetables and herbs from a Kenyan farm",
  },
  {
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=80&auto=format&fit=crop",
    alt: "Colourful bowl of heritage grains and vegetables",
  },
  {
    src: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=1600&q=80&auto=format&fit=crop",
    alt: "Kenyan farmer harvesting fresh produce in the Rift Valley",
  },
  {
    src: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1600&q=80&auto=format&fit=crop",
    alt: "Artisanal food preparation — hand-crafted small batch cooking",
  },
  {
    src: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1600&q=80&auto=format&fit=crop",
    alt: "Fermented probiotic beverages in glass bottles",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80&auto=format&fit=crop",
    alt: "Heritage African meal plated with care and precision",
  },
  {
    src: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1600&q=80&auto=format&fit=crop",
    alt: "Organic ingredients laid out on a natural surface",
  },
  {
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80&auto=format&fit=crop",
    alt: "Slow-cooked African dish with aromatic spices",
  },
];

interface HeroSlideshowProps {
  /** Gradient direction — defaults to left-to-right for homepage hero */
  gradient?: "left" | "top" | "none";
  /** Show dot indicators and progress bar */
  showControls?: boolean;
}

export default function HeroSlideshow({
  gradient = "left",
  showControls = true,
}: HeroSlideshowProps) {
  const { current, paused, goTo, setPaused } = useSlideshow();

  const gradientClass =
    gradient === "left"
      ? "bg-gradient-to-r from-ink/90 via-ink/60 to-transparent"
      : gradient === "top"
      ? "bg-gradient-to-t from-ink/90 via-ink/50 to-ink/10"
      : "";

  return (
    <div
      className="absolute inset-0 z-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — crossfade */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
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

      {/* Dot indicators */}
      {showControls && (
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
