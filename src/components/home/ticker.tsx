import Link from "next/link";
import { formatPct } from "@/lib/format";
import { primaryOutcome } from "@/lib/pricing";
import type { MarketSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

function TickerRow({ items, ariaHidden }: { items: MarketSummary[]; ariaHidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-2 pr-2" aria-hidden={ariaHidden}>
      {items.map((m) => {
        const p = primaryOutcome(m);
        const up = m.change24h >= 0;
        return (
          <li key={m.slug}>
            <Link
              href={`/markets/${m.slug}`}
              tabIndex={ariaHidden ? -1 : 0}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs transition-colors hover:border-border-strong"
            >
              <span aria-hidden>{m.icon}</span>
              <span className="max-w-[220px] truncate font-medium">{m.title}</span>
              <span className="font-bold tabular">{formatPct(p.price)}</span>
              <span className={cn("font-semibold tabular", up ? "text-yes" : "text-no")}>
                {up ? "▲" : "▼"} {Math.abs(m.change24h * 100).toFixed(1)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Full-bleed scrolling price ticker. Pure CSS animation, pauses on hover, static list for reduced motion. */
export function Ticker({ markets }: { markets: MarketSummary[] }) {
  const items = markets.slice(0, 14);
  return (
    <div className="-mx-4 overflow-hidden border-b border-border bg-bg/60 py-2 sm:-mx-6 sm:px-0" aria-label="Live market prices">
      <div className="flex items-center gap-3 px-4 sm:px-6">
        <span className="hidden shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand sm:flex">
          <span className="size-1.5 rounded-full bg-brand animate-pulse-dot" aria-hidden /> Live
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden fade-edge-x pause-on-hover motion-reduce:overflow-x-auto motion-reduce:scrollbar-none">
          <div className="flex w-max animate-marquee motion-reduce:animate-none">
            <TickerRow items={items} />
            <TickerRow items={items} ariaHidden />
          </div>
        </div>
      </div>
    </div>
  );
}
