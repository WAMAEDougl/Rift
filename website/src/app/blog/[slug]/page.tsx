"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, blogPosts, formatDate } from "@/lib/blog";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <section className="pt-28 pb-20 min-h-screen bg-muted/50">
        <div className="max-w-2xl mx-auto px-4 text-center py-20">
          <h1 className="text-3xl font-bold text-earth mb-4">
            Post Not Found
          </h1>
          <Link
            href="/blog"
            className="text-primary font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  const categoryColors: Record<string, string> = {
    recipe: "bg-orange-100 text-orange-700",
    news: "bg-blue-100 text-blue-700",
    health: "bg-green-100 text-green-700",
    "behind-the-scenes": "bg-purple-100 text-purple-700",
  };

  // Get related posts
  const related = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  // Markdown rendering is handled by react-markdown below

  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-sand via-warm to-amber-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <Link
              href="/blog"
              className="text-sm text-primary font-medium inline-flex items-center gap-1 mb-6 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  categoryColors[post.category]
                }`}
              >
                {post.category.replace("-", " ")}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readTime}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-earth leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                By <span className="font-medium text-earth">{post.author}</span>{" "}
                &bull; {formatDate(post.date)}
              </p>
              <button
                onClick={() => navigator.share?.({ title: post.title, url: window.location.href }).catch(() => {})}
                className="p-2 text-muted-foreground/60 hover:text-primary transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <article className="prose prose-gray max-w-none prose-headings:text-earth prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-em:text-muted-foreground">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>
          </AnimatedSection>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Share CTA */}
          <div className="bg-sand rounded-2xl p-6 mt-8 text-center">
            <p className="font-semibold text-earth mb-2">
              Enjoyed this article?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Share it with friends and family who care about good food and
              nutrition.
            </p>
            <div className="flex justify-center gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(post.title + " - Ayola Foods Blog")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Share on WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
              >
                Share on X
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-earth mb-8">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      categoryColors[p.category]
                    }`}
                  >
                    {p.category.replace("-", " ")}
                  </span>
                  <h3 className="text-base font-bold text-earth mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {p.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
