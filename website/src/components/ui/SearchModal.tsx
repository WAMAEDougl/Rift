"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import { recipes } from "@/lib/recipes";
import { blogPosts } from "@/lib/blog";
import { AnimatePresence, motion } from "framer-motion";

interface SearchResult {
  title: string;
  description: string;
  href: string;
  type: "product" | "recipe" | "blog";
  icon: string;
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
  };

  const results: SearchResult[] = [];

  if (query.length >= 2) {
    const q = query.toLowerCase();

    // Search products
    products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.ingredients.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .forEach((p) =>
        results.push({
          title: p.name,
          description: p.description,
          href: `/products/${p.slug}`,
          type: "product",
          icon: p.categorySlug === "meals" ? "🍽️" : p.categorySlug === "beverages" ? "🥤" : p.categorySlug === "packaged" ? "🌾" : "🍳",
        })
      );

    // Search recipes
    recipes
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.excerpt.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .forEach((r) =>
        results.push({
          title: r.title,
          description: r.excerpt,
          href: `/recipes/${r.slug}`,
          type: "recipe",
          icon: "👩‍🍳",
        })
      );

    // Search blog
    blogPosts
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((b) =>
        results.push({
          title: b.title,
          description: b.excerpt,
          href: `/blog/${b.slug}`,
          type: "blog",
          icon: "📝",
        })
      );
  }

  const typeLabels: Record<string, { label: string; color: string }> = {
    product: { label: "Product", color: "bg-amber-100 text-amber-700" },
    recipe: { label: "Recipe", color: "bg-green-100 text-green-700" },
    blog: { label: "Blog", color: "bg-blue-100 text-blue-700" },
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-muted rounded-full transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Search panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
            >
              <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                  <Search className="w-5 h-5 text-muted-foreground/60 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products, recipes, articles..."
                    className="flex-1 text-foreground placeholder-gray-400 outline-none text-base"
                  />
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-muted rounded-full"
                  >
                    <X className="w-4 h-4 text-muted-foreground/60" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                  {query.length < 2 ? (
                    <div className="p-6 text-center text-muted-foreground/60 text-sm">
                      Type at least 2 characters to search...
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground/60 text-sm">
                      No results found for &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    <div className="py-2">
                      {results.map((r, i) => (
                        <Link
                          key={`${r.type}-${i}`}
                          href={r.href}
                          onClick={handleClose}
                          className="flex items-start gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-xl mt-0.5">{r.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground text-sm truncate">
                                {r.title}
                              </p>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                  typeLabels[r.type].color
                                }`}
                              >
                                {typeLabels[r.type].label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {r.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-muted/50 border-t border-border flex items-center justify-between text-xs text-muted-foreground/60">
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">
                      Ctrl+K
                    </kbd>{" "}
                    to search
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">
                      Esc
                    </kbd>{" "}
                    to close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
