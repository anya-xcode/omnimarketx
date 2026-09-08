import Link from "next/link";
import { Sparkline } from "@/components/ui/sparkline";
import { formatCents, formatCompact, formatMoney, formatPct } from "@/lib/format";
import { primaryOutcome } from "@/lib/pricing";
import type { MarketSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CATEGORY_MAP } from "@/lib/categories";
import { ChangeChip, MarketIcon } from "./bits";
import { WatchButton } from "./watch-button";

/** Dense list row used by the list view, trending page and sidebars. */
export function MarketRow({ market, rank, className, compact }: { market: MarketSummary; rank?: number; className?: string; compact?: boolean }) {
  const primary = primaryOutcome(market);
  const href = `/markets/${market.slug}`;
  const yes = market.outcomes.find((o) => o.id === "yes");
  const no = market.outcomes.find((o) => o.id === "no");
  return (
    <div className={cn("relative flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-2 sm:px-4", className)}>
      {rank !== undefined && <span className="w-5 shrink-0 text-center text-sm font-bold tabular text-faint">{rank}</span>}
      <MarketIcon icon={market.icon} category={market.category} size="sm" />
      <div className="min-w-0 flex-1">
        <Link href={href} className="line-clamp-1 text-sm font-semibold after:absolute after:inset-0 after:content-['']">
          {market.title}
        </Link>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span style={{ color: CATEGORY_MAP[market.category].color }} className="font-semibold">
            {CATEGORY_MAP[market.category].label}
          </span>
          <span className="tabular">{formatMoney(market.volume)} vol</span>
          {!compact && <span className="hidden tabular sm:inline">{formatCompact(market.traders)} traders</span>}
        </p>
      </div>
      {!compact && <Sparkline data={market.spark} width={72} height={26} className="hidden md:block" />}
      <div className="flex shrink-0 flex-col items-end">
        <span className="text-base font-bold tabular leading-none">{formatPct(primary.price)}</span>
        <ChangeChip delta={market.change24h} className="mt-1" />
      </div>
      {!compact && (
        <div className="relative z-10 hidden shrink-0 gap-1.5 sm:flex">
          {market.kind === "binary" && yes && no ? (
            <>
              <Link href={`${href}?outcome=yes`} className="rounded-lg bg-yes-soft px-2.5 py-1.5 text-xs font-bold text-yes hover:brightness-95 dark:hover:brightness-125">
                Yes {formatCents(yes.price)}
              </Link>
              <Link href={`${href}?outcome=no`} className="rounded-lg bg-no-soft px-2.5 py-1.5 text-xs font-bold text-no hover:brightness-95 dark:hover:brightness-125">
                No {formatCents(no.price)}
              </Link>
            </>
          ) : (
            <Link href={href} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-3">
              {market.outcomes.length} outcomes
            </Link>
          )}
        </div>
      )}
      {!compact && <WatchButton slug={market.slug} className="relative z-10 hidden sm:flex" />}
    </div>
  );
}
