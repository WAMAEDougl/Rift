"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const INTERVAL = 5000;

export interface BannerSlide {
  id: string;
  src: string;
  mobileSrc?: string | null;
  alt: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  titleColor?: string | null;
  subtitleColor?: string | null;
  descriptionColor?: string | null;
}

// Fallback slides used when DB has no hero banners
export const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: "fallback-1",
    src: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1600&q=80&auto=format&fit=crop",
    alt: "Steaming clay pot of heritage African stew on a rustic wooden table",
  },
  {
    id: "fallback-2",
    src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80&auto=format&fit=crop",
    alt: "Vibrant African spices and grains arranged on a market stall",
  },
  {
    id: "fallback-3",
    src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1600&q=80&auto=format&fit=crop",
    alt: "Fresh vegetables and herbs from a Kenyan farm",
  },
  {
    id: "fallback-4",
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=80&auto=format&fit=crop",
    alt: "Colourful bowl of heritage grains and vegetables",
  },
  {
    id: "fallback-5",
    src: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=1600&q=80&auto=format&fit=crop",
    alt: "Kenyan farmer harvesting fresh produce in the Rift Valley",
  },
  {
    id: "fallback-6",
    src: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1600&q=80&auto=format&fit=crop",
    alt: "Artisanal food preparation — hand-crafted small batch cooking",
  },
  {
    id: "fallback-7",
    src: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1600&q=80&auto=format&fit=crop",
    alt: "Fermented probiotic beverages in glass bottles",
  },
  {
    id: "fallback-8",
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80&auto=format&fit=crop",
    alt: "Heritage African meal plated with care and precision",
  },
  {
    id: "fallback-9",
    src: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1600&q=80&auto=format&fit=crop",
    alt: "Organic ingredients laid out on a natural surface",
  },
  {
    id: "fallback-10",
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80&auto=format&fit=crop",
    alt: "Slow-cooked African dish with aromatic spices",
  },
];

interface SlideshowContextType {
  slides: BannerSlide[];
  current: number;
  paused: boolean;
  fromDB: boolean;
  goTo: (index: number) => void;
  setPaused: (paused: boolean) => void;
}

const SlideshowContext = createContext<SlideshowContextType | undefined>(undefined);

export function SlideshowProvider({ children }: { children: ReactNode }) {
  const [slides, setSlides] = useState<BannerSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fromDB, setFromDB] = useState(false);

  // Fetch hero banners from DB on mount
  useEffect(() => {
    fetch("/api/banners?position=hero")
      .then((r) => r.json())
      .then((data) => {
        if (data.banners && data.banners.length > 0) {
          const dbSlides: BannerSlide[] = data.banners.map(
            (b: {
              id: string;
              image_url: string;
              mobile_image_url?: string | null;
              title: string;
              subtitle?: string | null;
              description?: string | null;
              link_url?: string | null;
              link_text?: string | null;
              title_color?: string | null;
              subtitle_color?: string | null;
              description_color?: string | null;
            }) => ({
              id: b.id,
              src: b.image_url,
              mobileSrc: b.mobile_image_url,
              alt: b.title,
              title: b.title,
              subtitle: b.subtitle,
              description: b.description,
              linkUrl: b.link_url,
              linkText: b.link_text,
              titleColor: b.title_color,
              subtitleColor: b.subtitle_color,
              descriptionColor: b.description_color,
            })
          );
          setSlides(dbSlides);
          setFromDB(true);
          setCurrent(0);
        }
      })
      .catch(() => {
        // Keep fallback slides on error
      });
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <SlideshowContext.Provider value={{ slides, current, paused, fromDB, goTo, setPaused }}>
      {children}
    </SlideshowContext.Provider>
  );
}

export function useSlideshow() {
  const ctx = useContext(SlideshowContext);
  if (!ctx) throw new Error("useSlideshow must be used within SlideshowProvider");
  return ctx;
}

export const INTERVAL_MS = INTERVAL;
