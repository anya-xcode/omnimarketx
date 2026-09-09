"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Flame, Sparkles, TrendingUp } from "lucide-react";
import { MarketCard, MarketCardSkeleton } from "@/components/market/market-card";
import type { MarketSummary, Paginated } from "@/lib/types";
import { cn } from "@/lib/utils";
import { api } from "@/store/session";
import { useI18n } from "@/lib/i18n/client";
import type { DictKey } from "@/lib/i18n";

const TABS = [
  { id: "trending", label: "home.tabs.trending" as DictKey, icon: Flame, query: "sort=trending", href: "/markets" },
  { id: "new", label: "home.tabs.new" as DictKey, icon: Sparkles, query: "sort=newest", href: "/markets?sort=newest" },
  { id: "closing", label: "home.tabs.closing" as DictKey, icon: Clock, query: "sort=closing&filter=closing-soon", href: "/markets?sort=closing&filter=closing-soon" },
  { id: "volume", label: "home.tabs.volume" as DictKey, icon: TrendingUp, query: "sort=volume&filter=high-volume", href: "/markets?sort=volume&filter=high-volume" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** Home market rail with client-side tabs. The first tab is server-rendered; others load from the API and are cached per tab. */
export function MarketTabs({ initial, limit = 8 }: { initial: MarketSummary[]; limit?: number }) {
  const { t } = useI18n();
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
          {TABS.map((tb) => (
            <button
              key={tb.id}
              role="tab"
              type="button"
              aria-selected={tab === tb.id}
              onClick={() => setTab(tb.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                tab === tb.id ? "bg-surface text-text shadow-card" : "text-muted hover:text-text",
              )}
            >
              <tb.icon className={cn("size-4", tab === tb.id && "text-brand")} /> {t(tb.label)}
            </button>
          ))}
        </div>
        <Link href={current.href} className="text-sm font-semibold text-brand hover:underline">
          {t("common.viewAll")} →
        </Link>
      </div>
      <div key={tab} className="grid gap-4 stagger sm:grid-cols-2 xl:grid-cols-4" role="tabpanel">
        {items ? items.map((m) => <MarketCard key={m.slug} market={m} />) : Array.from({ length: limit }).map((_, i) => <MarketCardSkeleton key={i} />)}
        {items && items.length === 0 && <p className="col-span-full py-10 text-center text-sm text-muted">{t("home.nothing")}</p>}
      </div>
    </section>
  );
}
