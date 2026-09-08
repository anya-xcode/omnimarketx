import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { formatMoney, formatPct } from "@/lib/format";
import { primaryOutcome } from "@/lib/pricing";
import { listMarkets } from "@/lib/repo";

export const metadata: Metadata = { title: "Categories", description: "Browse prediction markets by category." };
export const revalidate = 60;

export default async function CategoriesPage() {
  const all = await listMarkets({ limit: 60, sort: "volume" });
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Browse</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-muted">Every topic we cover, with the biggest market in each.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const markets = all.items.filter((m) => m.category === c.id);
          const top = markets[0];
          const volume = markets.reduce((s, m) => s + m.volume, 0);
          return (
            <Link key={c.id} href={`/markets?category=${c.id}`} className="card group flex flex-col p-5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-float">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl text-2xl" style={{ background: `color-mix(in srgb, ${c.color} 15%, var(--surface-2))` }}>{c.emoji}</span>
                <div>
                  <h2 className="font-bold">{c.label}</h2>
                  <p className="text-xs text-muted">{markets.length} market{markets.length === 1 ? "" : "s"} · {formatMoney(volume)} vol</p>
                </div>
                <ArrowRight className="ml-auto size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              <p className="mt-3 text-sm text-muted">{c.description}</p>
              {top && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs">
                  <span className="line-clamp-1 flex-1 font-medium">{top.title}</span>
                  <span className="font-bold tabular" style={{ color: c.color }}>{formatPct(primaryOutcome(top).price)}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
