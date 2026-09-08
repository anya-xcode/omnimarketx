import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/primitives";
import { MoversRail } from "@/components/home/sections";
import { formatCents, formatMoney, timeAgo } from "@/lib/format";
import { getMovers, getRecentActivity } from "@/lib/repo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Activity", description: "Latest trades placed across OmniMarketX markets." };
export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const [trades, movers] = await Promise.all([getRecentActivity(40), getMovers(6)]);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Live</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Activity className="size-7 text-brand" /> Activity
        </h1>
        <p className="mt-1 text-sm text-muted">Every trade placed on the platform, newest first.</p>
      </div>
      <section>
        <h2 className="mb-3 text-sm font-bold">Biggest movers</h2>
        <MoversRail markets={movers} />
      </section>
      {trades.length === 0 ? (
        <EmptyState icon={Activity} title="No trades yet" description="Be the first. Trades placed by anyone show up here in real time." action={{ label: "Browse markets", href: "/markets" }} />
      ) : (
        <ul className="card divide-y divide-border">
          {trades.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className={cn("w-12 rounded-md px-2 py-0.5 text-center text-xs font-bold uppercase", t.side === "buy" ? "bg-yes-soft text-yes" : "bg-no-soft text-no")}>{t.side}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/markets/${t.marketSlug}`} className="line-clamp-1 font-medium hover:text-brand">{t.marketTitle}</Link>
                <p className="text-xs text-muted">
                  {t.shares.toFixed(2)} <strong className="text-text">{t.outcomeLabel}</strong> @ {formatCents(t.price)} · <span suppressHydrationWarning>{timeAgo(t.createdAt)}</span>
                </p>
              </div>
              <span className="font-semibold tabular">{formatMoney(t.amount, { compact: false })}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
