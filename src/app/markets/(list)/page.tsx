import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketsBrowser } from "@/components/market/markets-browser";
import { MarketCardSkeleton } from "@/components/market/market-card";
import { CATEGORY_MAP } from "@/lib/categories";
import { parseMarketQuery } from "@/lib/market-query";
import { listMarkets } from "@/lib/repo";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Markets",
  description: "Browse every open prediction market on OmniMarketX. Filter by category, sort by volume or momentum, and trade on what you know.",
};

export default async function MarketsPage(props: PageProps<"/markets">) {
  const sp = await props.searchParams;
  const query = parseMarketQuery(sp);
  const [page, { t }] = await Promise.all([listMarkets(query), getT()]);
  const cat = query.category && query.category !== "all" ? CATEGORY_MAP[query.category] : null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">{t("markets.browse")}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{cat ? `${cat.emoji} ${cat.label}` : t("markets.all")}</h1>
        <p className="mt-1 text-sm text-muted">{cat ? cat.description : t("markets.allSub")}</p>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <MarketCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <MarketsBrowser key={JSON.stringify(query)} initial={page} query={query} />
      </Suspense>
    </div>
  );
}
