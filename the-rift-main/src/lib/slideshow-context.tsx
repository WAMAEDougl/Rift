"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const INTERVAL = 6000;

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

// Fallback slides — used when DB returns nothing (also serves as mock data for testing)
export const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: "fallback-1",
    src: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80&auto=format&fit=crop",
    alt: "Heritage Jollof",
    title: "Heritage Jollof",
    subtitle: "Earth-first · Slow-Cooked",
    description: "Smoky, slow-cooked rice infused with sun-ripened highland peppers and a whisper of locust bean.",
    linkUrl: "/shop",
    linkText: "Order Now",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-2",
    src: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&auto=format&fit=crop",
    alt: "Rabbit Wet Fry",
    title: "Rabbit Wet Fry",
    subtitle: "High Protein · Free-Range",
    description: "Tender free-range rabbit slow-cooked in a rich tomato and herb sauce. High protein, low fat.",
    linkUrl: "/shop",
    linkText: "Shop Now",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-3",
    src: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80&auto=format&fit=crop",
    alt: "Plantain Probiotic Kvass",
    title: "Plantain Probiotic Kvass",
    subtitle: "Gut Health · Zero Sugar Added",
    description: "Kenya's first plantain-fermented probiotic beverage. Naturally fizzy, live cultures, no sugar added.",
    linkUrl: "/shop",
    linkText: "Try It",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-4",
    src: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop",
    alt: "Finger Millet Flour",
    title: "Finger Millet Flour",
    subtitle: "Heritage Grains · Ships Countrywide",
    description: "Stone-ground wimbi flour from smallholder farms in the Rift Valley. Higher calcium than milk per gram.",
    linkUrl: "/shop",
    linkText: "Shop Now",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-5",
    src: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&auto=format&fit=crop",
    alt: "Goat Milk Masala Tea",
    title: "Goat Milk Masala Tea",
    subtitle: "Gut-Friendly · Naturally Homogenised",
    description: "Rich, creamy masala chai brewed with fresh goat milk — easier to digest, warming to the soul.",
    linkUrl: "/shop",
    linkText: "Order Now",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-6",
    src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&auto=format&fit=crop",
    alt: "Heritage Ugali Breakfast",
    title: "Heritage Ugali Breakfast",
    subtitle: "Low GI · Stone-Ground",
    description: "Sorghum and millet ugali with free-range eggs and fermented vegetables. Fuel your morning right.",
    linkUrl: "/shop",
    linkText: "Order Breakfast",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-7",
    src: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80&auto=format&fit=crop",
    alt: "Synbiotic Porridge",
    title: "Synbiotic Porridge",
    subtitle: "Science-Backed · Fermented",
    description: "Fermented finger millet with live probiotic cultures and prebiotic fibre — formulated by a food scientist.",
    linkUrl: "/shop",
    linkText: "Shop Now",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-8",
    src: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80&auto=format&fit=crop",
    alt: "Sorghum Flour Blend",
    title: "Sorghum Flour Blend",
    subtitle: "Low GI · High Protein · Gluten-Free",
    description: "Heritage sorghum blended with amaranth. Perfect for ugali, porridge, and baking. Ships to all 47 counties.",
    linkUrl: "/shop",
    linkText: "Shop Now",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-9",
    src: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&q=80&auto=format&fit=crop",
    alt: "Turkey Egg Omelette",
    title: "Turkey Egg Omelette",
    subtitle: "Nutrient-Dense · Rare Find",
    description: "Fluffy omelette made with nutrient-rich turkey eggs, garden vegetables, and heritage spices.",
    linkUrl: "/shop",
    linkText: "Order Now",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
  {
    id: "fallback-10",
    src: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1600&q=80&auto=format&fit=crop",
    mobileSrc: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80&auto=format&fit=crop",
    alt: "Golden Puffs",
    title: "Golden Puffs",
    subtitle: "Artisanal · Fresh-Made Daily",
    description: "Yeasted dough balls fried until amber and finished with a warm ginger glaze. A beloved breakfast treat.",
    linkUrl: "/shop",
    linkText: "Order Breakfast",
    titleColor: "#ffffff",
    subtitleColor: "#e8d5a3",
    descriptionColor: "rgba(255,255,255,0.72)",
  },
];

interface SlideshowContextType {
  slides: BannerSlide[];
  current: number;
  paused: boolean;
  fromDB: boolean;
  ready: boolean;
  goTo: (index: number) => void;
  setPaused: (paused: boolean) => void;
}

const SlideshowContext = createContext<SlideshowContextType | undefined>(undefined);

export function SlideshowProvider({ children }: { children: ReactNode }) {
  // Hold in pending state until the DB fetch resolves — no slides shown before then
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fromDB, setFromDB] = useState(false);
  const [ready, setReady] = useState(false); // wait for fetch before starting

  // Fetch hero banners from DB on mount — decide slides once, never swap mid-play
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
        } else {
          // No DB banners — use fallbacks (treat them as DB slides since they have full metadata)
          setSlides(FALLBACK_SLIDES);
          setFromDB(true);
        }
        setReady(true);
      })
      .catch(() => {
        // Fetch failed — use fallbacks (treat them as DB slides since they have full metadata)
        setSlides(FALLBACK_SLIDES);
        setFromDB(true);
        setReady(true);
      });
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  // Only start the timer once slides are ready
  useEffect(() => {
    if (!ready || paused || slides.length === 0) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next, paused, ready, slides.length]);

  return (
    <SlideshowContext.Provider value={{ slides, current, paused, fromDB, ready, goTo, setPaused }}>
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
