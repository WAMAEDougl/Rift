import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, getWhatsAppOrderLink } from "@/lib/constants";
import { MapPin, Clock, Phone, Navigation, Utensils, Heart, Star, ArrowRight } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";

export const metadata: Metadata = {
  title: "Visit Us — AyolaFoods",
  description:
    "Visit Ayola Foods restaurant at Ruhan Plaza, Kahawa Sukari, Nairobi. Healthy meals, probiotic beverages, and heritage flour blends. Open Mon-Sat 7AM-8PM.",
};

const operatingHours = [
  { day: "Monday - Friday", hours: "7:00 AM - 8:00 PM" },
  { day: "Saturday", hours: "7:00 AM - 8:00 PM" },
  { day: "Sunday", hours: "8:00 AM - 6:00 PM" },
];

const whatToExpect = [
  {
    icon: Utensils,
    title: "Fresh Made-to-Order Meals",
    description: "Every meal is prepared fresh when you order. No reheating, no shortcuts. Real cooking, real flavor.",
  },
  {
    icon: Heart,
    title: "Health-First Menu",
    description: "Unconventional proteins (rabbit, turkey eggs), probiotic beverages, and gut-friendly sides you won't find anywhere else.",
  },
  {
    icon: Star,
    title: "Meet the Food Scientist",
    description: "Founder Prisca Kiragu is often in the kitchen. Ask her about the science behind any product — she loves sharing!",
  },
];

const directions = [
  "From Thika Road, take the Kahawa Sukari exit",
  "Head towards Quickmatt Supermarket",
  "Ruhan Plaza is right near Quickmatt — Ground Floor, Room 23",
  "Look for the Ayola Foods signage at the entrance",
];

export default function VisitUsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <HeroSlideshow gradient="top" showControls={false} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-2xl">
            <span className="eyebrow text-accent/80 inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Visit Us
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl font-medium text-white">
              Come Eat with Us in Kahawa Sukari
            </h1>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">
              Experience the full Rift &amp; Root menu — from signature pilau and rabbit
              wet fry to plantain kvass and goat milk tea.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href={getWhatsAppOrderLink("Hi! I'd like to visit the restaurant. Are you open today?")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground transition hover:opacity-90"
              >
                <Phone className="w-4 h-4" /> Call Ahead
              </a>
              <a
                href={BUSINESS.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Location Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl border border-border p-6">
              <MapPin className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">Address</h3>
              <p className="text-muted-foreground">{BUSINESS.fullAddress}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <Clock className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-3">Operating Hours</h3>
              <div className="space-y-2">
                {operatingHours.map((h) => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium text-foreground">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <Phone className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">Contact</h3>
              <p className="text-muted-foreground text-sm mb-1">{BUSINESS.phone1}</p>
              <p className="text-muted-foreground text-sm mb-1">{BUSINESS.phone2}</p>
              <p className="text-muted-foreground text-sm">{BUSINESS.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-medium text-foreground mb-3">
              What to Expect
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              First time visiting? Here&apos;s what makes the Ayola experience special.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {whatToExpect.map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directions */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium text-foreground mb-6 text-center">
            How to Find Us
          </h2>
          <div className="space-y-4">
            {directions.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-muted-foreground pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 ink-gradient text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium text-background mb-4">
            Can&apos;t Visit? We Deliver!
          </h2>
          <p className="text-background/70 mb-8 text-lg">
            Order ready meals for Nairobi delivery, or get our packaged products shipped anywhere in Kenya.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-background px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-accent"
          >
            Order Online <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
