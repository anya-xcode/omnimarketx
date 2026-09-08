import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ChevronRight, ExternalLink, Share2, Users } from "lucide-react";
import { CategoryBadge, MarketIcon, regionFlag } from "@/components/market/bits";
import { MarketRow } from "@/components/market/market-row";
import { MarketWorkspace } from "@/components/market/market-workspace";
import { WatchButton } from "@/components/market/watch-button";
import { ShareButton } from "@/components/market/share-button";
import { CATEGORY_MAP } from "@/lib/categories";
import { formatCompact, formatDate, formatMoney, formatPct, timeUntil } from "@/lib/format";
import { isMarketClosed, primaryOutcome } from "@/lib/pricing";
import { getMarket, getRelatedMarkets } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/markets/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const market = await getMarket(slug);
  if (!market) return { title: "Market not found" };
  const primary = primaryOutcome(market);
  const description = `${formatPct(primary.price)} ${market.kind === "binary" ? "chance of Yes" : primary.label}. ${formatMoney(market.volume)} traded. ${market.resolution}`.slice(0, 200);
  return { title: market.title, description, openGraph: { title: market.title, description } };
}

export default async function MarketPage(props: PageProps<"/markets/[slug]">) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const market = await getMarket(slug);
  if (!market) notFound();
  const related = await getRelatedMarkets(market, 3);
  const cat = CATEGORY_MAP[market.category];
  const flag = regionFlag(market.region);
  const initialOutcome = typeof sp.outcome === "string" ? sp.outcome : undefined;
  const closed = isMarketClosed(market);

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-text">Home</Link>
        <ChevronRight className="size-3" />
        <Link href="/markets" className="hover:text-text">Markets</Link>
        <ChevronRight className="size-3" />
        <Link href={`/markets?category=${market.category}`} className="hover:text-text">{cat.label}</Link>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <MarketIcon icon={market.icon} category={market.category} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={market.category} />
            {flag && <span aria-label={market.region}>{flag}</span>}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted" suppressHydrationWarning>
              <CalendarClock className="size-3.5" /> {timeUntil(market.closesAt)}
            </span>
          </div>
          <h1 className="mt-2 text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-[28px]">{market.title}</h1>
          {market.subtitle && <p className="mt-1 text-sm text-muted">{market.subtitle}</p>}
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <div className="flex items-center gap-1.5"><dt className="text-muted">Volume</dt><dd className="font-semibold tabular">{formatMoney(market.volume)}</dd></div>
            <div className="flex items-center gap-1.5"><dt className="text-muted"><Users className="size-3.5" aria-hidden /><span className="sr-only">Traders</span></dt><dd className="font-semibold tabular">{formatCompact(market.traders)} traders</dd></div>
            <div className="flex items-center gap-1.5"><dt className="text-muted">Closes</dt><dd className="font-semibold">{formatDate(market.closesAt)}</dd></div>
          </dl>
        </div>
        <div className="flex shrink-0 gap-1">
          <ShareButton title={market.title} />
          <WatchButton slug={market.slug} size="md" />
        </div>
      </header>

      <MarketWorkspace market={market} initialOutcome={initialOutcome} closed={closed} />

      <section className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="card p-5">
          <h2 className="text-base font-bold">Rules and resolution</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-faint">Resolution</dt>
              <dd className="leading-relaxed text-text">{market.resolution}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-faint">Resolution sources</dt>
              <dd className="flex flex-wrap gap-2">
                {market.resolutionSources.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium">
                    <ExternalLink className="size-3 text-faint" /> {s}
                  </span>
                ))}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
              <div><dt className="text-xs text-muted">Category</dt><dd className="font-medium">{cat.emoji} {cat.label}</dd></div>
              <div><dt className="text-xs text-muted">Created</dt><dd className="font-medium">{formatDate(market.createdAt)}</dd></div>
              <div><dt className="text-xs text-muted">Closes</dt><dd className="font-medium">{formatDate(market.closesAt)}</dd></div>
              <div><dt className="text-xs text-muted">Liquidity</dt><dd className="font-medium tabular">{formatMoney(market.liquidity)}</dd></div>
            </div>
          </dl>
          {market.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {market.tags.map((t) => (
                <Link key={t} href={`/markets?q=${encodeURIComponent(t)}`} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted hover:text-text">
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden self-start">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold">More in {cat.label}</h2>
            <Link href={`/markets?category=${market.category}`} className="text-xs font-semibold text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {related.map((m) => (
              <MarketRow key={m.slug} market={m} compact />
            ))}
          </div>
        </div>
      </section>
      <p className="flex items-center gap-1.5 text-xs text-faint">
        <Share2 className="size-3" /> Share this market to discuss it on Pulse.
      </p>
    </div>
  );
}
