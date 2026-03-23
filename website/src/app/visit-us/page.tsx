import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, getWhatsAppOrderLink } from "@/lib/constants";
import { MapPin, Clock, Phone, Navigation, Utensils, Heart, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Visit Us | Ayola Foods KE",
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
    icon: <Utensils className="w-6 h-6" />,
    title: "Fresh Made-to-Order Meals",
    description: "Every meal is prepared fresh when you order. No reheating, no shortcuts. Real cooking, real flavor.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Health-First Menu",
    description: "Unconventional proteins (rabbit, turkey eggs), probiotic beverages, and gut-friendly sides you won't find anywhere else.",
  },
  {
    icon: <Star className="w-6 h-6" />,
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

export default function VisitUs() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-sand via-warm to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Visit Us
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-earth mt-3 mb-4">
                Come Eat with Us in Kahawa Sukari
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Experience the full Ayola Foods menu at our restaurant — from
                signature pilau and rabbit wet fry to plantain kvass and goat
                milk tea. Everything is prepared fresh by our team, led by food
                scientist Prisca Kiragu.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={getWhatsAppOrderLink("Hi! I'd like to visit the restaurant. Are you open today?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Ahead
                </a>
                <a
                  href={BUSINESS.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors"
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border h-80 lg:h-96">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.0!2d36.9487!3d-1.1962!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3ffd56859239%3A0xb5741c3010640f68!2sayolafoodke!5e0!3m2!1sen!2ske!4v1`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ayola Foods Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Address */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <MapPin className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Address</h3>
              <p className="text-muted-foreground">
                {BUSINESS.fullAddress}
              </p>
            </div>

            {/* Hours */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <Clock className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-3">Operating Hours</h3>
              <div className="space-y-2">
                {operatingHours.map((h) => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium text-foreground">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <Phone className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Contact</h3>
              <p className="text-muted-foreground text-sm mb-1">{BUSINESS.phone1}</p>
              <p className="text-muted-foreground text-sm mb-1">{BUSINESS.phone2}</p>
              <p className="text-muted-foreground text-sm">{BUSINESS.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-earth mb-3">What to Expect</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              First time visiting? Here&apos;s what makes the Ayola experience special.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {whatToExpect.map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directions */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-earth mb-6 text-center">
            How to Find Us
          </h2>
          <div className="space-y-4">
            {directions.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-muted-foreground pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Can&apos;t Visit? We Deliver!</h2>
          <p className="text-white/80 mb-8 text-lg">
            Order ready meals for Nairobi delivery, or get our packaged products shipped anywhere in Kenya.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-card text-primary px-8 py-3.5 rounded-xl font-bold hover:bg-card/90 transition-colors"
          >
            Order Online <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
