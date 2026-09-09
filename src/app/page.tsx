import Link from "next/link";
import { CategoryChips } from "@/components/market/category-chips";
import { SectionHeader } from "@/components/ui/primitives";
import { Hero } from "@/components/home/hero";
import { MarketTabs } from "@/components/home/market-tabs";
import { Ticker } from "@/components/home/ticker";
import { CtaBand, GroupsPreview, HowItWorks, MoversRail, PulsePreview, TopPredictors } from "@/components/home/sections";
import { getFeaturedMarkets, getFeed, getGroups, getMarketsBySlugs, getMovers, getPlatformStats, getTraders, getTrendingMarkets } from "@/lib/repo";

export const revalidate = 30;

export default async function HomePage() {
  const [featured, top, movers, feed, traders, groups, stats] = await Promise.all([
    getFeaturedMarkets(1),
    getTrendingMarkets(14),
    getMovers(8),
    getFeed(3),
    getTraders("all", "roi"),
    getGroups(),
    getPlatformStats(),
  ]);
  const spotlight = featured[0] ?? top[0];
  const feedMarkets = await getMarketsBySlugs(feed.map((p) => p.marketSlug).filter((s): s is string => Boolean(s)));
  const feedMap = new Map(feedMarkets.map((m) => [m.slug, m]));

  return (
    <div className="space-y-10">
      <div className="-mt-6">
        <Ticker markets={top} />
      </div>
      <Hero spotlight={spotlight} stats={stats} />

      <section>
        <SectionHeader title="Browse by category" href="/categories" hrefLabel="All categories" />
        <CategoryChips active="all" basePath="/markets" />
      </section>

      <MarketTabs initial={top.slice(0, 8)} />

      <section>
        <SectionHeader title="Market movers" description="Biggest 24-hour probability swings" href="/trending" />
        <MoversRail markets={movers} />
      </section>

      <HowItWorks />

      <section className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <SectionHeader title="What people are predicting" description="Live from Pulse, the OmniMarketX community feed" href="/feed" hrefLabel="Open Pulse" />
          <PulsePreview posts={feed} markets={feedMap} />
        </div>
        <div className="space-y-5 lg:pt-12">
          <TopPredictors traders={traders.slice(0, 5)} />
          <GroupsPreview groups={groups.slice(0, 3)} />
          <p className="text-center text-xs text-faint">
            Prices are demo data. <Link href="/blog/how-to-read-a-market-price" className="underline hover:text-text">How prices work</Link>
          </p>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
