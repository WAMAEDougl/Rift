"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Truck, Star } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";
import SearchModal from "@/components/ui/SearchModal";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getItem, STORAGE_KEYS } from "@/lib/utils/storage";
import type { SavedCustomer } from "@/types/api";

const sub = () => () => {};
function useIsClient() {
  return useSyncExternalStore(sub, () => true, () => false);
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isClient = useIsClient();
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  // Get customer name without useEffect setState
  const customerName = isClient
    ? (getItem<SavedCustomer>(STORAGE_KEYS.CUSTOMER)?.name?.split(" ")[0] || "")
    : "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHeroPage = pathname === "/";

  const links = [
    { href: "/products", label: "Products" },
    { href: "/recipes", label: "Recipes" },
    { href: "/community", label: "Community" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Promo bar — integrated, not separate */}
      {!scrolled && (
        <div className="text-white/80 text-[11px] text-center py-1.5 px-4" style={{ backgroundColor: "#78350F" }}>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-amber-400" />
            <strong className="text-white">Free delivery</strong> over KES 2,000
            <span className="mx-2 text-white/30">|</span>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <strong className="text-white">4.8</strong> rating from 1,400+ customers
            {customerName && (
              <>
                <span className="mx-2 text-white/30">|</span>
                <span>Welcome back, <strong className="text-amber-300">{customerName}</strong></span>
              </>
            )}
          </span>
        </div>
      )}

      {/* Main nav */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-card/95 dark:bg-[#1a1410]/95 backdrop-blur-xl shadow-sm border-b border-border/50 dark:border-white/5"
            : isHeroPage
            ? "bg-transparent"
            : "bg-card/95 dark:bg-[#1a1410]/95 backdrop-blur-xl"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                <span className="text-white font-bold">A</span>
              </div>
              <div className="leading-none">
                <span className={`text-xl font-bold tracking-tight ${!scrolled && isHeroPage ? "text-white" : "text-earth"}`}>
                  Ayola
                </span>
                <span className={`text-xl font-normal ml-0.5 ${!scrolled && isHeroPage ? "text-white/70" : "text-primary"}`}>
                  Foods
                </span>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? !scrolled && isHeroPage ? "text-white bg-card/15" : "text-primary bg-primary/5"
                      : !scrolled && isHeroPage ? "text-white/80 hover:text-white hover:bg-card/10" : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-1.5">
              <div className={!scrolled && isHeroPage ? "text-white" : ""}><SearchModal /></div>
            <ThemeToggle className={!scrolled && isHeroPage ? "text-white/80 hover:text-white" : "text-muted-foreground"} />

              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2.5 rounded-lg transition-colors ${
                  !scrolled && isHeroPage ? "text-white/80 hover:text-white hover:bg-card/10" : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                }`}
                aria-label="Your cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <Link
                href="/products"
                className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]"
              >
                Order Now
              </Link>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex items-center gap-1.5">
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2.5 rounded-lg ${!scrolled && isHeroPage ? "text-white" : "text-muted-foreground"}`}
                aria-label="Your cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-lg ${!scrolled && isHeroPage ? "text-white" : "text-muted-foreground"}`}
                aria-label="Menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-0.5 py-3 px-2 bg-card/98 backdrop-blur-xl border-t border-border/50">
                <Link href="/" onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium ${pathname === "/" ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted/50"}`}>
                  Home
                </Link>
                {links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium ${pathname === link.href ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted/50"}`}>
                    {link.label}
                  </Link>
                ))}
                <div className="px-2 pt-2">
                  <Link href="/products" onClick={() => setIsOpen(false)}
                    className="block bg-primary text-white py-3 rounded-xl text-sm font-semibold text-center shadow-lg shadow-primary/20">
                    Order Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
