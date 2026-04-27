"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const SLIDE_COUNT = 10;
const INTERVAL = 5000;

interface SlideshowContextType {
  current: number;
  paused: boolean;
  goTo: (index: number) => void;
  setPaused: (paused: boolean) => void;
}

const SlideshowContext = createContext<SlideshowContextType | undefined>(undefined);

export function SlideshowProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDE_COUNT);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  // Global timer — keeps running across page navigations
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <SlideshowContext.Provider value={{ current, paused, goTo, setPaused }}>
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
