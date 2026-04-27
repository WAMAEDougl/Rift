"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { formatDate } from "@/lib/blog";

interface BlogClientProps {
  posts: BlogPost[];
  categories: { slug: string; label: string }[];
}

export default function BlogClient({ posts, categories }: BlogClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? posts.slice(1) // skip featured (shown above)
      : posts.filter((p) => p.category === activeCategory);

  const categoryEmoji: Record<string, string> = {
    recipe: "🍳",
    news: "📰",
    health: "💚",
    "behind-the-scenes": "🌾",
  };

  return (
    <>
      {/* Category Filter */}
      <section className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 bg-muted/30 min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-card rounded-2xl overflow-hidden border border-border hover:shadow-card transition-all hover:-translate-y-1 group"
              >
                <div className="h-44 bg-muted flex items-center justify-center">
                  <span className="text-5xl opacity-70 group-hover:scale-110 transition-transform">
                    {categoryEmoji[post.category] ?? "📖"}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold capitalize text-foreground">
                      {post.category.replace("-", " ")}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground/60">
                      {post.author} &bull; {formatDate(post.date)}
                    </p>
                    <span className="text-primary text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground/60 text-lg">
                No posts in this category yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
