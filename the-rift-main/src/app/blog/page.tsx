import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { blogPosts, blogCategories, formatDate } from "@/lib/blog";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Stories & Recipes — AyolaFoods",
  description:
    "Recipes, nutrition tips, farmer stories, and the latest from Ayola Foods. Discover the goodness behind every product.",
  openGraph: {
    title: "Stories & Recipes — AyolaFoods",
    description: "Recipes, nutrition tips, farmer stories, and the latest from Ayola Foods.",
  },
};

export default function BlogPage() {
  const featured = blogPosts[0];

  return (
    <>
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <span className="eyebrow inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Blog &amp; Recipes
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
            Stories &amp; Recipes
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Recipes, nutrition tips, farmer stories, and the latest from Ayola Foods.
          </p>
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <Link
            href={`/blog/${featured.slug}`}
            className="block rounded-[2rem] overflow-hidden border border-border bg-card hover:shadow-card transition-all group"
          >
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto ink-gradient flex items-center justify-center">
                <span className="text-8xl opacity-70 group-hover:scale-110 transition-transform">
                  📖
                </span>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize text-foreground">
                    {featured.category.replace("-", " ")}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground/60">
                    {featured.author} &bull; {formatDate(featured.date)}
                  </p>
                  <span className="text-primary font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Interactive grid */}
      <BlogClient posts={blogPosts} categories={blogCategories} />
    </>
  );
}
