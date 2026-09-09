"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Flame, Sparkles, TrendingUp } from "lucide-react";
import { MarketCard, MarketCardSkeleton } from "@/components/market/market-card";
import type { MarketSummary, Paginated } from "@/lib/types";
import { cn } from "@/lib/utils";
import { api } from "@/store/session";

const TABS = [
  { id: "trending", label: "Trending", icon: Flame, query: "sort=trending", href: "/markets" },
  { id: "new", label: "New", icon: Sparkles, query: "sort=newest", href: "/markets?sort=newest" },
  { id: "closing", label: "Closing soon", icon: Clock, query: "sort=closing&filter=closing-soon", href: "/markets?sort=closing&filter=closing-soon" },
  { id: "volume", label: "High volume", icon: TrendingUp, query: "sort=volume&filter=high-volume", href: "/markets?sort=volume&filter=high-volume" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** Home market rail with client-side tabs. The first tab is server-rendered; others load from the API and are cached per tab. */
export function MarketTabs({ initial, limit = 8 }: { initial: MarketSummary[]; limit?: number }) {
  const [tab, setTab] = useState<TabId>("trending");
  const [cache, setCache] = useState<Partial<Record<TabId, MarketSummary[]>>>({ trending: initial });
  const items = cache[tab];
  const current = TABS.find((t) => t.id === tab)!;

  useEffect(() => {
    if (cache[tab]) return;
    let alive = true;
    api<Paginated<MarketSummary>>(`/api/markets?${current.query}&limit=${limit}`)
      .then((page) => alive && setCache((c) => ({ ...c, [tab]: page.items })))
      .catch(() => alive && setCache((c) => ({ ...c, [tab]: [] })));
    return () => {
      alive = false;
    };
  }, [tab, cache, current.query, limit]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div role="tablist" aria-label="Market lists" className="flex gap-1 overflow-x-auto scrollbar-none rounded-xl bg-surface-2 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                tab === t.id ? "bg-surface text-text shadow-card" : "text-muted hover:text-text",
              )}
            >
              <t.icon className={cn("size-4", tab === t.id && "text-brand")} /> {t.label}
            </button>
          ))}
        </div>
        <Link href={current.href} className="text-sm font-semibold text-brand hover:underline">
          View all →
        </Link>
      </div>
      <div key={tab} className="grid gap-4 stagger sm:grid-cols-2 xl:grid-cols-4" role="tabpanel">
        {items ? items.map((m) => <MarketCard key={m.slug} market={m} />) : Array.from({ length: limit }).map((_, i) => <MarketCardSkeleton key={i} />)}
        {items && items.length === 0 && <p className="col-span-full py-10 text-center text-sm text-muted">Nothing here right now.</p>}
      </div>
    </section>
  );
}
