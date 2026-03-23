"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { blogPosts, blogCategories, getPostsByCategory, formatDate } from "@/lib/blog";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("all");
  const posts = getPostsByCategory(activeCategory);

  const categoryColors: Record<string, string> = {
    recipe: "bg-orange-100 text-orange-700",
    news: "bg-blue-100 text-blue-700",
    health: "bg-green-100 text-green-700",
    "behind-the-scenes": "bg-purple-100 text-purple-700",
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-sand via-warm to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Blog & Recipes
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-earth mt-3 mb-4">
              Stories & Recipes
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Recipes, nutrition tips, farmer stories, and the latest from Ayola
              Foods. Discover the goodness behind every product.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-20 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4 overflow-x-auto no-scrollbar">
            {blogCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
                    ? "bg-primary text-white shadow-md"
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
      <section className="py-16 bg-muted/50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Post */}
          {activeCategory === "all" && blogPosts[0] && (
            <AnimatedSection className="mb-12">
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                    <span className="text-8xl opacity-70 group-hover:scale-110 transition-transform">
                      📖
                    </span>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          categoryColors[blogPosts[0].category]
                        }`}
                      >
                        {blogPosts[0].category.replace("-", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blogPosts[0].readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-earth mb-3 group-hover:text-primary transition-colors">
                      {blogPosts[0].title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground/60">
                        {blogPosts[0].author} &bull;{" "}
                        {formatDate(blogPosts[0].date)}
                      </p>
                      <span className="text-primary font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          )}

          {/* Posts Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeCategory === "all" ? posts.slice(1) : posts).map(
              (post, i) => (
                <AnimatedSection key={post.slug} delay={i * 0.05}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group h-full"
                  >
                    <div className="h-44 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <span className="text-5xl opacity-70 group-hover:scale-110 transition-transform">
                        {post.category === "recipe"
                          ? "🍳"
                          : post.category === "news"
                          ? "📰"
                          : post.category === "health"
                          ? "💚"
                          : "🌾"}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            categoryColors[post.category]
                          }`}
                        >
                          {post.category.replace("-", " ")}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-earth mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                        {post.excerpt}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {post.author} &bull; {formatDate(post.date)}
                      </p>
                    </div>
                  </Link>
                </AnimatedSection>
              )
            )}
          </div>

          {posts.length === 0 && (
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
