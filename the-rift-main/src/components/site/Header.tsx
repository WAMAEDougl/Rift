"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/community", label: "Community" },
  { to: "/contact", label: "Contact" },
] as const;

type NavLink = (typeof navLinks)[number];

export function Header({ storeName }: { storeName?: string | null }) {
  const displayName = storeName ?? "Rift & Root";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();

  // Detect scroll to add shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-[0_1px_0_0_var(--color-border)]"
          : "bg-background/80 backdrop-blur-sm border-b border-border/40"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label={`${displayName} home`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-base font-medium tracking-tight transition group-hover:bg-primary/90">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className="font-display text-[1.15rem] tracking-tight leading-none">
            {displayName}
          </span>
        </Link>

        {/* ── Desktop nav — pushed to the right ── */}
        <nav className="hidden items-center gap-1 ml-auto mr-4 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "text-foreground bg-muted/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Cart button */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-background transition hover:bg-primary"
            aria-label={`Cart — ${totalItems} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Basket</span>
            {totalItems > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-foreground">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setOpen(false)}
                className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile CTA */}
            <div className="mt-3 border-t border-border pt-3 pb-2">
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-background transition hover:bg-primary"
              >
                <ShoppingBag className="h-4 w-4" />
                Basket
                {totalItems > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-foreground">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
