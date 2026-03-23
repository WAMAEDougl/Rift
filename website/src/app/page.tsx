"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import CountUp from "@/components/CountUp";
import Testimonials from "@/components/Testimonials";
import TextGenerateEffect from "@/components/aceternity/TextGenerateEffect";
import SpotlightCard from "@/components/aceternity/SpotlightCard";
import GlowingButton from "@/components/aceternity/GlowingButton";
import { categories } from "@/lib/products";
import {
  Leaf, Heart, BookOpen, ShieldCheck, Truck, Award, MapPin,
  ArrowRight, Sparkles, Beaker, Star, Users, ChefHat, Phone,
} from "lucide-react";

const values = [
  {
    title: "Food Scientist Led",
    description: "Every product is formulated by Prisca Kiragu, a trained food scientist from JKUAT — real science, not just marketing.",
    icon: <Beaker className="w-6 h-6" />,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Gut Health First",
    description: "Probiotics, fermented beverages, and synbiotic porridge — we prioritize your digestive wellness.",
    icon: <Heart className="w-6 h-6" />,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Locally Sourced",
    description: "We work directly with Kenyan farmers for indigenous grains — finger millet, sorghum, amaranth, and plantain.",
    icon: <MapPin className="w-6 h-6" />,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Heritage Innovation",
    description: "Traditional African ingredients reimagined with modern food science. Ancestral wisdom meets today's nutrition.",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-purple-500 to-violet-600",
  },
];

const stats = [
  { value: 1400, suffix: "+", label: "Happy Customers", icon: <Users className="w-5 h-5" /> },
  { value: 14, suffix: "+", label: "Products & Meals", icon: <ChefHat className="w-5 h-5" /> },
  { value: 47, suffix: "", label: "Counties Shipped", icon: <Truck className="w-5 h-5" /> },
  { value: 48, suffix: "", label: "Customer Rating", icon: <Star className="w-5 h-5" />, display: "4.8" },
];

export default function Home() {
  return (
    <>
      {/* ============================== */}
      {/* HERO — Full viewport, dramatic */}
      {/* ============================== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-earth via-primary-dark to-earth" />

        {/* Animated grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }} />

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-card/10 backdrop-blur-sm text-white/80 text-xs font-semibold uppercase tracking-wider rounded-full mb-8 border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Made in Kenya &bull; 100% Natural &bull; Food Scientist Formulated
            </motion.div>

            {/* Headline with text generate effect */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              <TextGenerateEffect
                words="Eat Healthy. Enjoy Life."
                className="text-white"
                duration={0.6}
              />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-2xl"
            >
              Kenya&apos;s first health-food restaurant and packaged products brand.
              Probiotic beverages, heritage flour blends, and meals formulated by a
              food scientist — from Kahawa Sukari to all 47 counties.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <GlowingButton href="/products">
                <Leaf className="w-5 h-5" /> Explore Products
              </GlowingButton>
              <GlowingButton href="/visit-us" variant="secondary">
                <MapPin className="w-5 h-5" /> Visit Us
              </GlowingButton>
              <GlowingButton
                href="https://wa.me/254713280550?text=Hi%20Ayola%20Foods!%20I'd%20like%20to%20order."
                variant="whatsapp"
                external
              >
                <Phone className="w-5 h-5" /> Order Now
              </GlowingButton>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 rounded-full bg-card/60"
            />
          </div>
        </motion.div>
      </section>

      {/* ============================== */}
      {/* STATS — Floating cards         */}
      {/* ============================== */}
      <section className="relative -mt-16 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <SpotlightCard className="p-6 text-center">
                  <div className="text-primary mb-2 flex justify-center">{stat.icon}</div>
                  <p className="text-3xl sm:text-4xl font-bold text-earth">
                    {stat.display || <><CountUp end={stat.value} />{stat.suffix}</>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* CATEGORIES — Bento grid        */}
      {/* ============================== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                What We Offer
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-earth mt-3 mb-4">
                Four Ways to Eat Better
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                From our restaurant kitchen to your doorstep — heritage nutrition
                in every form.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/products?category=${cat.slug}`}>
                  <SpotlightCard
                    className="p-6 h-full hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                    spotlightColor={cat.slug === "meals" ? "rgba(245, 158, 11, 0.15)" : cat.slug === "beverages" ? "rgba(5, 150, 105, 0.15)" : cat.slug === "packaged" ? "rgba(234, 88, 12, 0.15)" : "rgba(234, 179, 8, 0.15)"}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4`}>
                      {cat.icon}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{cat.tagline}</p>
                    {cat.priceFrom && (
                      <p className="text-xs text-primary font-semibold">
                        From KES {cat.priceFrom?.toLocaleString()}
                      </p>
                    )}
                    {cat.shipsCountrywide && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-2">
                        <Truck className="w-3 h-3" /> Ships countrywide
                      </span>
                    )}
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* WHY AYOLA — Values grid         */}
      {/* ============================== */}
      <section className="py-24 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Why Ayola
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-earth mt-3 mb-4">
                Not Just Food. A Movement.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                We&apos;re proving that Africa&apos;s indigenous foods are not just nutritious —
                they&apos;re world-class.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <SpotlightCard className="p-6 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} text-white flex items-center justify-center mb-4`}>
                    {value.icon}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* FOUNDER STORY                   */}
      {/* ============================== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div>
                <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
                  <Award className="w-4 h-4" /> Our Story
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold text-earth mt-3 mb-6">
                  A Food Scientist&apos;s Mission
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-earth">Prisca Kiragu</strong> saw a problem:
                    Kenya&apos;s indigenous superfoods — finger millet, sorghum, amaranth,
                    plantain — were disappearing from daily life, replaced by processed imports.
                  </p>
                  <p>
                    Armed with a food science degree from <strong className="text-earth">JKUAT</strong> and
                    a passion for gut health, she founded Ayola Foods to bring
                    these heritage ingredients back — reimagined with modern nutrition science.
                  </p>
                  <p>
                    Today, Ayola Foods serves healthy meals at Kahawa Sukari and ships
                    packaged products to all 47 counties. Every product is formulated
                    by a food scientist. Every ingredient is locally sourced.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  <GlowingButton href="/about">
                    Read Full Story <ArrowRight className="w-4 h-4" />
                  </GlowingButton>
                  <GlowingButton href="/health-hub" variant="secondary">
                    <Beaker className="w-4 h-4" /> Health Hub
                  </GlowingButton>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary/10 via-sand to-secondary/10 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-4xl font-bold mb-6">
                      PK
                    </div>
                    <h3 className="text-2xl font-bold text-earth mb-1">Prisca Kiragu</h3>
                    <p className="text-primary font-medium">Food Scientist (JKUAT)</p>
                    <p className="text-muted-foreground text-sm mt-1">Founder & CEO, Ayola Foods</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-6">
                      {["Fermentation Expert", "Gut Health Specialist", "JHUB Africa Innovatech"].map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-card/80 text-xs font-medium text-earth shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating credential badges */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg px-4 py-3 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <Beaker className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-earth">JKUAT</p>
                      <p className="text-[10px] text-muted-foreground/60">Food Science</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg px-4 py-3 border border-border"
                >
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs font-bold text-earth">100% Natural</p>
                      <p className="text-[10px] text-muted-foreground/60">No preservatives</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* TESTIMONIALS                    */}
      {/* ============================== */}
      <section className="py-24 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
                <Star className="w-4 h-4 fill-primary" /> Customer Love
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-earth mt-3 mb-4">
                What Our Customers Say
              </h2>
            </div>
          </AnimatedSection>
          <Testimonials />
        </div>
      </section>

      {/* ============================== */}
      {/* FINAL CTA — Dark dramatic      */}
      {/* ============================== */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-earth via-primary-dark to-earth" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 3, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to Eat Better?
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Join 1,400+ Kenyans who&apos;ve made the switch to heritage nutrition.
              Order online, visit our restaurant, or call us.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <GlowingButton href="/products">
                <Leaf className="w-5 h-5" /> Shop Products
              </GlowingButton>
              <GlowingButton href="/recipes" variant="secondary">
                <ChefHat className="w-5 h-5" /> Watch Recipes
              </GlowingButton>
              <GlowingButton
                href="https://wa.me/254713280550"
                variant="whatsapp"
                external
              >
                <Phone className="w-5 h-5" /> WhatsApp Us
              </GlowingButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
