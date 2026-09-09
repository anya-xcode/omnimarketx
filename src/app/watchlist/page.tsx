import type { Metadata } from "next";
import { Star } from "lucide-react";
import { MarketCard } from "@/components/market/market-card";
import { EmptyState } from "@/components/ui/primitives";
import { getMarketsBySlugs, getUser } from "@/lib/repo";
import { getSessionId } from "@/lib/session";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Watchlist", robots: { index: false } };

export default async function WatchlistPage() {
  const id = await getSessionId();
  const { t } = await getT();
  const user = await getUser(id);
  const markets = user ? await getMarketsBySlugs(user.watchlist) : [];
  const ordered = user ? [...markets].sort((a, b) => user.watchlist.indexOf(b.slug) - user.watchlist.indexOf(a.slug)) : markets;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Yours</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Star className="size-7 fill-warn text-warn" /> {t("watchlist.title")}
        </h1>
        <p className="mt-1 text-sm text-muted">Markets you starred. Tap the star on any card to add or remove one.</p>
      </div>
      {ordered.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Your watchlist is empty"
          description="Star markets you want to keep an eye on and they'll show up here and in the sidebar with live prices."
          action={{ label: "Browse markets", href: "/markets" }}
        />
      ) : (
        <div className="grid gap-4 stagger sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((m) => (
            <MarketCard key={m.slug} market={m} />
          ))}
        </div>
      )}
    </div>
  );
}
