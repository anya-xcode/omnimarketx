import type { Metadata } from "next";
import { Activity, Flame } from "lucide-react";
import { CategoryChips } from "@/components/market/category-chips";
import { MarketRow } from "@/components/market/market-row";
import { MoversRail } from "@/components/home/sections";
import { isCategoryId } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import { getMovers, getPlatformStats, getTrendingMarkets } from "@/lib/repo";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Trending", description: "Real-time ranking of the most active prediction markets on OmniMarketX." };
export const revalidate = 30;

export default async function TrendingPage(props: PageProps<"/trending">) {
  const sp = await props.searchParams;
  const category = isCategoryId(sp.category) ? sp.category : "all";
  const [markets, movers, stats, { t }] = await Promise.all([getTrendingMarkets(15, category), getMovers(8), getPlatformStats(), getT()]);
  const avgMove = markets.length ? markets.reduce((s, m) => s + Math.abs(m.change24h), 0) / markets.length : 0;
  const pulse = Math.min(100, Math.round(avgMove * 2500));
  const label = pulse < 25 ? "Calm" : pulse < 55 ? "Active" : pulse < 80 ? "Volatile" : "Frenzied";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Live</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Flame className="size-7 text-brand" /> {t("trending.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("trending.sub")}</p>
      </div>

      <CategoryChips active={category} basePath="/trending" />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold">Top {markets.length} markets</h2>
            <span className="text-xs text-muted">Updated every 30s</span>
          </div>
          <ol className="divide-y divide-border">
            {markets.map((m, i) => (
              <li key={m.slug}>
                <MarketRow market={m} rank={i + 1} />
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Market pulse</p>
            <p className="mt-1 text-2xl font-bold">{label}</p>
            <p className="text-xs text-muted">Average 24h move across trending markets</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-gradient-to-r from-yes via-warn to-no" style={{ width: `${Math.max(4, pulse)}%` }} />
            </div>
            <p className="mt-1 text-right text-xs font-semibold tabular">{pulse}/100</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
              <div><dt className="text-xs text-muted">Total volume</dt><dd className="font-bold tabular">{formatMoney(stats.volume)}</dd></div>
              <div><dt className="text-xs text-muted">Open markets</dt><dd className="font-bold tabular">{stats.markets}</dd></div>
            </dl>
          </div>
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Activity className="size-4 text-brand" /> Biggest movers
            </h2>
            <MoversRail markets={movers.slice(0, 4)} />
          </div>
        </aside>
      </div>
    </div>
  );
}
