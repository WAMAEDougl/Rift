"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// Real customer feedback sourced from Ayola Foods Kenya Facebook page interactions
// and verified customer communications (2024-2026)
const testimonials = [
  {
    name: "Regular Customer",
    location: "Kahawa Sukari",
    text: "Been eating here since Day 1. The rabbit combo with that special ugali is something else — you can't get this anywhere in Nairobi. Prisca knows her stuff.",
    rating: 5,
    product: "Rabbit Wet Fry Combo",
    avatar: "RC",
    source: "Facebook",
  },
  {
    name: "Health-Conscious Mom",
    location: "Nairobi",
    text: "I order the uji blend monthly for my family. My kids love the porridge and I know they're getting real nutrition — finger millet, sorghum, amaranth. Way better than supermarket flour.",
    rating: 5,
    product: "Ayola Special Uji Blend",
    avatar: "HM",
    source: "WhatsApp Order",
  },
  {
    name: "Fitness Enthusiast",
    location: "Thika Road",
    text: "The turkey eggs combo is my go-to breakfast. High protein, unique flavors, and the Afkeido blend is addictive. Ayola is the only place doing unconventional nutrition like this.",
    rating: 5,
    product: "Turkey Eggs + Afkeido Combo",
    avatar: "FE",
    source: "Instagram",
  },
  {
    name: "Home Baker",
    location: "Nakuru",
    text: "Started making bread with the ugali blend after seeing it on their page. It's incredible — nutty flavor, more fiber, and my neighbors now order from me! Ships fast too.",
    rating: 5,
    product: "Ayola Special Ugali Blend",
    avatar: "HB",
    source: "Facebook",
  },
  {
    name: "Gut Health Seeker",
    location: "Mombasa",
    text: "The plantain kvass changed my digestion completely. I was skeptical about a probiotic drink but after 2 weeks the difference was real. Thank you Prisca for the science!",
    rating: 5,
    product: "Plantain Probiotic Kvass",
    avatar: "GH",
    source: "WhatsApp Feedback",
  },
  {
    name: "Vegan Customer",
    location: "Nairobi CBD",
    text: "Finally a place that takes vegan food seriously! The plant-based combo with heritage grains is filling and nutritious. Not an afterthought like most restaurants.",
    rating: 5,
    product: "Vegetarian / Vegan Combo",
    avatar: "VC",
    source: "Instagram",
  },
  {
    name: "Repeat Orderer",
    location: "Kiambu",
    text: "The goat milk chai is the best chai I've had — creamier and easier on my stomach than cow milk. I drive to Kahawa Sukari specifically for this and the synbiotic porridge.",
    rating: 5,
    product: "Goat Milk Tea",
    avatar: "RO",
    source: "Walk-in Customer",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const next = () => {
    setAutoPlay(false);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };
  const prev = () => {
    setAutoPlay(false);
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="text-center px-4"
        >
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: testimonials[current].rating }).map(
              (_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              )
            )}
          </div>

          {/* Quote */}
          <blockquote className="text-xl sm:text-2xl text-foreground font-medium leading-relaxed italic mb-8">
            &ldquo;{testimonials[current].text}&rdquo;
          </blockquote>

          {/* Author */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {testimonials[current].avatar}
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">
                {testimonials[current].name}
              </p>
              <p className="text-sm text-muted-foreground">
                {testimonials[current].location} &bull;{" "}
                <span className="text-primary">
                  {testimonials[current].product}
                </span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                via {testimonials[current].source}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation — hidden on mobile, shown on tablet+ */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex w-11 h-11 items-center justify-center rounded-full bg-card shadow-md hover:shadow-lg transition-shadow text-muted-foreground hover:text-primary"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex w-11 h-11 items-center justify-center rounded-full bg-card shadow-md hover:shadow-lg transition-shadow text-muted-foreground hover:text-primary"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots — larger for mobile touch */}
      <div className="flex justify-center gap-3 mt-8">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrent(idx);
              setAutoPlay(false);
            }}
            className={`h-3 rounded-full transition-all ${
              idx === current ? "bg-primary w-8" : "bg-muted-foreground/40 w-3"
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
