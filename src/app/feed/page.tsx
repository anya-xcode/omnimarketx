import type { Metadata } from "next";
import { Composer } from "@/components/feed/composer";
import { PostCard } from "@/components/feed/post-card";
import { GroupsPreview, TopPredictors } from "@/components/home/sections";
import { getFeed, getGroups, getMarketsBySlugs, getTraders } from "@/lib/repo";

export const metadata: Metadata = { title: "Pulse", description: "What the OmniMarketX community is predicting right now." };
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const [posts, traders, groups] = await Promise.all([getFeed(30), getTraders("all", "roi"), getGroups()]);
  const markets = await getMarketsBySlugs(posts.map((p) => p.marketSlug).filter((s): s is string => Boolean(s)));
  const map = new Map(markets.map((m) => [m.slug, m]));
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Community</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Pulse</h1>
          <p className="mt-1 text-sm text-muted">Share your reasoning, follow sharp traders, argue politely.</p>
        </div>
        <Composer />
        {posts.map((p) => (
          <PostCard key={p.id} post={p} market={p.marketSlug ? map.get(p.marketSlug) : undefined} />
        ))}
      </div>
      <aside className="space-y-5 lg:sticky lg:top-20">
        <TopPredictors traders={traders.slice(0, 5)} />
        <GroupsPreview groups={groups} />
      </aside>
    </div>
  );
}
