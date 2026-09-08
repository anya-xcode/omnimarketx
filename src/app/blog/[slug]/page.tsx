import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getBlogPosts } from "@/lib/repo";

export const revalidate = 300;

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = (await getBlogPosts()).find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.excerpt } : { title: "Article not found" };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = (await getBlogPosts()).find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text"><ArrowLeft className="size-4" /> All articles</Link>
      <div className="flex aspect-[21/9] items-center justify-center rounded-3xl text-7xl" style={{ background: post.gradient }} aria-hidden>{post.emoji}</div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-brand">{post.category}</span>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-faint">{post.author} · {formatDate(post.publishedAt)} · {post.readMinutes} min read</p>
      </div>
      <div className="card space-y-4 p-6 text-[15px] leading-relaxed text-muted">
        <p className="text-lg text-text">{post.excerpt}</p>
        <p>Prediction markets turn opinions into prices. When you buy a Yes share at 62¢, you are saying the event is more than 62% likely to happen. If you are right, each share pays $1; if you are wrong it pays nothing. Because everyone puts money behind their view, the price is usually a sharper forecast than any single expert.</p>
        <p>On OmniMarketX every market publishes its resolution rules and sources up front, so there is never ambiguity about how a question settles. Prices move with each trade, and the crowd&apos;s probability is visible on every card.</p>
        <p>This article is a placeholder in the demo build. The full editorial content lives in the production CMS.</p>
      </div>
    </article>
  );
}
