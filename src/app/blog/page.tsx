import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getBlogPosts } from "@/lib/repo";

export const metadata: Metadata = { title: "Blog", description: "Insights, trends and guides from the world of prediction markets." };
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Blog</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Insights. <span className="text-gradient">Trends.</span> Opportunities.</h1>
        <p className="mt-1 text-sm text-muted">Stay ahead with strategies, explainers and platform updates.</p>
      </div>

      {featured && (
        <Link href={`/blog/${featured.slug}`} className="card group grid overflow-hidden md:grid-cols-2">
          <div className="flex aspect-[16/9] items-center justify-center text-7xl md:aspect-auto" style={{ background: featured.gradient }} aria-hidden>
            {featured.emoji}
          </div>
          <div className="flex flex-col justify-center p-6">
            <span className="w-fit rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-bold uppercase text-brand">Featured · {featured.category}</span>
            <h2 className="mt-3 text-xl font-bold leading-snug group-hover:text-brand">{featured.title}</h2>
            <p className="mt-2 text-sm text-muted">{featured.excerpt}</p>
            <p className="mt-4 flex items-center gap-2 text-xs text-faint">{featured.author} · {formatDate(featured.publishedAt)} · <Clock className="size-3" /> {featured.readMinutes} min read</p>
          </div>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card group flex flex-col overflow-hidden transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-float">
            <div className="flex aspect-[16/9] items-center justify-center text-5xl" style={{ background: p.gradient }} aria-hidden>{p.emoji}</div>
            <div className="flex flex-1 flex-col p-4">
              <span className="text-[11px] font-bold uppercase tracking-wide text-brand">{p.category}</span>
              <h2 className="mt-1.5 line-clamp-2 font-bold leading-snug group-hover:text-brand">{p.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
              <p className="mt-auto pt-3 text-xs text-faint">{formatDate(p.publishedAt)} · {p.readMinutes} min read</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
