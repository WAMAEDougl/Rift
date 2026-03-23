import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";
import NewsletterSignup from "@/components/community/NewsletterSignup";
import GlowingButton from "@/components/aceternity/GlowingButton";
import SpotlightCard from "@/components/aceternity/SpotlightCard";
import {
  Heart, Camera, Users, ChefHat, Award, ArrowRight, MessageCircle,
  Phone, Star, Leaf,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Community | Ayola Foods KE",
  description: "Join the Ayola Foods WhatsApp community — recipes, health tips, and exclusive offers from Kenya's first health-food brand.",
};

const customerStories = [
  { name: "Regular Customer", location: "Kahawa Sukari", quote: "Been eating here since Day 1. The rabbit combo with that special ugali is something else.", product: "Rabbit Wet Fry Combo", initials: "RC", source: "Facebook" },
  { name: "Health-Conscious Mom", location: "Nairobi", quote: "I order the uji blend monthly. My kids love the porridge and I know they're getting real nutrition.", product: "Ayola Special Uji Blend", initials: "HM", source: "WhatsApp" },
  { name: "Home Baker", location: "Nakuru", quote: "Started making bread with the ugali blend. It's incredible — my neighbors now order from me!", product: "Ayola Special Ugali Blend", initials: "HB", source: "Facebook" },
  { name: "Gut Health Seeker", location: "Mombasa", quote: "The plantain kvass changed my digestion completely. After 2 weeks the difference was real.", product: "Plantain Probiotic Kvass", initials: "GH", source: "WhatsApp" },
  { name: "Fitness Enthusiast", location: "Thika Road", quote: "The turkey eggs combo is my go-to breakfast. High protein, unique flavors. Ayola is the only place doing this.", product: "Turkey Eggs + Afkeido", initials: "FE", source: "Instagram" },
  { name: "Repeat Orderer", location: "Kiambu", quote: "The goat milk chai is the best I've had. I drive to Kahawa Sukari specifically for this.", product: "Goat Milk Tea", initials: "RO", source: "Walk-in" },
];

export default function Community() {
  return (
    <>
      {/* Hero — WhatsApp community as primary CTA */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-earth via-primary-dark to-earth" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
            <Users className="w-4 h-4" /> Our Community
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mt-3 mb-4">
            Join the Ayola Family
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg mb-8">
            We&apos;re not just selling food — we&apos;re building a movement. 1,400+ Kenyans
            eating healthier, sharing recipes, and supporting each other.
          </p>

          {/* Two equal community options */}
          <div className="flex flex-wrap justify-center gap-4">
            <GlowingButton
              href="https://wa.me/254713280550?text=Hi%20Ayola!%20I%20want%20to%20join%20the%20community"
              variant="whatsapp"
              external
            >
              <MessageCircle className="w-5 h-5" /> Join on WhatsApp
            </GlowingButton>
            <a
              href={BUSINESS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Join on Facebook
            </a>
            <GlowingButton href="/products">
              <Leaf className="w-5 h-5" /> Start Ordering
            </GlowingButton>
          </div>
        </div>
      </section>

      {/* Why Join — Psychology: tribal belonging */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-earth mb-3">Why Join Our WhatsApp Community?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              This isn&apos;t a broadcast list. It&apos;s a real community of health-conscious Kenyans.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ChefHat className="w-6 h-6" />, title: "Weekly Recipes", desc: "New recipes from Prisca every week — gut health tips, meal prep ideas, heritage dishes" },
              { icon: <Award className="w-6 h-6" />, title: "Exclusive Offers", desc: "Community-only discounts, early access to new products, and flash sales" },
              { icon: <Camera className="w-6 h-6" />, title: "Share Your Meals", desc: "Post your Ayola meal photos, get featured, and inspire others" },
              { icon: <Heart className="w-6 h-6" />, title: "Health Journeys", desc: "Real stories of gut health transformation, weight management, and better eating" },
            ].map((item) => (
              <SpotlightCard key={item.title} className="p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Stories */}
      <section className="py-20 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
              <Star className="w-4 h-4 fill-primary" /> Real Customers
            </span>
            <h2 className="text-3xl font-bold text-earth mt-3 mb-3">What Our Community Says</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerStories.map((story) => (
              <SpotlightCard key={story.name} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
                    {story.initials}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{story.name}</p>
                    <p className="text-xs text-muted-foreground/60">{story.location} &bull; via {story.source}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <span className="text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                  {story.product}
                </span>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Also follow us */}
      <section className="py-16" style={{ backgroundColor: "#78350F" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Also Follow Us</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Watch cooking demos, health tips, and behind-the-scenes content.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
              Facebook
            </a>
            <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:from-purple-700 hover:to-pink-600">
              Instagram
            </a>
            <a href={BUSINESS.tiktok} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors">
              TikTok
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-sand">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <NewsletterSignup />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-secondary to-secondary-light text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Movement?</h2>
          <p className="text-white/70 mb-8 text-lg">
            Join our WhatsApp community, order your first meal, or visit us in Kahawa Sukari.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <GlowingButton
              href="https://wa.me/254713280550?text=Hi%20Ayola!%20I%20want%20to%20join%20the%20community"
              variant="whatsapp"
              external
            >
              <Phone className="w-5 h-5" /> Join on WhatsApp
            </GlowingButton>
            <GlowingButton href="/products" variant="primary">
              <ArrowRight className="w-5 h-5" /> Order Now
            </GlowingButton>
          </div>
        </div>
      </section>
    </>
  );
}
