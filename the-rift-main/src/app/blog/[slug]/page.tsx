import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { blogPosts, getPostBySlug, formatDate } from "@/lib/blog";
import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-12 bg-muted/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="text-sm text-primary font-medium inline-flex items-center gap-1 mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize text-foreground">
              {post.category.replace("-", " ")}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTime}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
          <p className="text-sm text-muted-foreground">
            By{" "}
            <span className="font-medium text-foreground">{post.author}</span>{" "}
            &bull; {formatDate(post.date)}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </article>

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
          <div className="bg-muted/50 rounded-2xl p-6 mt-8 text-center">
            <p className="font-display text-lg font-medium text-foreground mb-2">
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
                className="rounded-full bg-secondary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground transition hover:opacity-90"
              >
                Share on WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
              >
                Share on X
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-medium text-foreground mb-8">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="bg-card rounded-xl p-5 border border-border hover:shadow-card transition-all group"
                >
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold capitalize text-foreground">
                    {p.category.replace("-", " ")}
                  </span>
                  <h3 className="font-display text-base font-medium text-foreground mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
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
