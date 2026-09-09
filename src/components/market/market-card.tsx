"use client";

import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { Sparkline } from "@/components/ui/sparkline";
import { ProgressBar } from "@/components/ui/primitives";
import { formatCents, formatCompact, formatMoney, formatPct } from "@/lib/format";
import { timeUntilLocalized } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { primaryOutcome } from "@/lib/pricing";
import type { MarketSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryBadge, ChangeChip, MarketIcon, outcomeColor, regionFlag } from "./bits";
import { LocalizedTitle } from "./localized-title";
import { WatchButton } from "./watch-button";

/**
 * Consistent-height market card. Binary and multi-outcome markets share the same
 * frame (header / body / footer / actions) so the grid stays aligned.
 */
export function MarketCard({ market, className, priority }: { market: MarketSummary; className?: string; priority?: boolean }) {
  const { t } = useI18n();
  const primary = primaryOutcome(market);
  const href = `/markets/${market.slug}`;
  const flag = regionFlag(market.region);
  const yes = market.outcomes.find((o) => o.id === "yes");
  const no = market.outcomes.find((o) => o.id === "no");
  const topOutcomes = [...market.outcomes].sort((a, b) => b.price - a.price).slice(0, 3);

  return (
    <article
      data-tour="market-card"
      className={cn("card group relative flex flex-col p-4 transition-[box-shadow,transform,border-color] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-float", className)}
      aria-label={market.title}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CategoryBadge category={market.category} />
          {flag && (
            <span className="text-sm" aria-label={market.region}>
              {flag}
            </span>
          )}
        </div>
        <WatchButton slug={market.slug} className="-mr-1.5 -mt-1.5" />
      </div>

      <div className="flex gap-3">
        <MarketIcon icon={market.icon} category={market.category} />
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-[1.35]">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[18px] after:content-['']">
            <LocalizedTitle slug={market.slug} title={market.title} />
          </Link>
        </h3>
      </div>

      <div className="mt-4 flex-1">
        {market.kind === "binary" ? (
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-bold tabular tracking-tight leading-none">{formatPct(primary.price)}</p>
              <p className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                {t("common.chance")} <ChangeChip delta={market.change24h} />
              </p>
            </div>
            <Sparkline data={market.spark} width={104} height={36} />
          </div>
        ) : (
          <ul className="space-y-2">
            {topOutcomes.map((o, i) => (
              <li key={o.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-[13px]">
                <span className="truncate font-medium">{o.label}</span>
                <span className="font-bold tabular">{formatPct(o.price)}</span>
                <ProgressBar value={o.price} color={outcomeColor(i)} className="col-span-2" />
              </li>
            ))}
            {market.outcomes.length > 3 && <li className="text-xs text-faint">{t("common.moreOutcomes", { n: market.outcomes.length - 3 })}</li>}
          </ul>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-muted">
        <span className="font-semibold tabular text-text">{formatMoney(market.volume)}</span>
        <span className="text-faint">{t("common.vol")}</span>
        <span className="flex items-center gap-1 tabular">
          <Users className="size-3.5" aria-hidden /> {formatCompact(market.traders)}
        </span>
        <span className="ml-auto flex items-center gap-1" suppressHydrationWarning>
          <Clock className="size-3.5" aria-hidden /> {timeUntilLocalized(t, market.closesAt)}
        </span>
      </div>

      <div className="relative z-10 mt-3 grid grid-cols-2 gap-2" data-tour="trade-buttons">
        {market.kind === "binary" && yes && no ? (
          <>
            <Link href={`${href}?outcome=yes`} className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-yes-soft text-sm font-bold text-yes transition-[filter] hover:brightness-95 dark:hover:brightness-125">
              {t("common.yes")} <span className="font-semibold opacity-80">{formatCents(yes.price)}</span>
            </Link>
            <Link href={`${href}?outcome=no`} className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-no-soft text-sm font-bold text-no transition-[filter] hover:brightness-95 dark:hover:brightness-125">
              {t("common.no")} <span className="font-semibold opacity-80">{formatCents(no.price)}</span>
            </Link>
          </>
        ) : (
          <Link href={href} className="col-span-2 flex h-9 items-center justify-center rounded-xl bg-surface-2 text-sm font-semibold transition-colors hover:bg-surface-3">
            {t("common.viewOutcomes", { n: market.outcomes.length })}
          </Link>
        )}
      </div>
      {priority && <span className="sr-only">Featured</span>}
    </article>
  );
}

export function MarketCardSkeleton() {
  return (
    <div className="card flex flex-col p-4" aria-hidden>
      <div className="mb-3 flex justify-between">
        <div className="skeleton h-5 w-20" />
        <div className="skeleton size-6" />
      </div>
      <div className="flex gap-3">
        <div className="skeleton size-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div className="skeleton h-9 w-20" />
        <div className="skeleton h-9 w-24" />
      </div>
      <div className="mt-4 skeleton h-3 w-1/2" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="skeleton h-9" />
        <div className="skeleton h-9" />
      </div>
    </div>
  );
}
