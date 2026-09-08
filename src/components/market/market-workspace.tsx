"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/primitives";
import { formatCents, formatPct } from "@/lib/format";
import { primaryOutcome } from "@/lib/pricing";
import type { Market } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChangeChip, outcomeColor } from "./bits";
import { TradePanel } from "./trade-panel";

const PriceChart = dynamic(() => import("./price-chart").then((m) => m.PriceChart), {
  ssr: false,
  loading: () => (
    <div className="card p-5">
      <div className="skeleton mb-4 h-5 w-32" />
      <div className="skeleton h-56 sm:h-64" />
    </div>
  ),
});

/**
 * Interactive area of the market page. Holds the live market state so a trade instantly
 * updates the header probability, outcome bars, chart and trade panel together.
 */
export function MarketWorkspace({ market: initial, initialOutcome, closed = false }: { market: Market; initialOutcome?: string; closed?: boolean }) {
  const [market, setMarket] = useState(initial);
  const [selected, setSelected] = useState(() =>
    initial.outcomes.some((o) => o.id === initialOutcome) ? (initialOutcome as string) : primaryOutcome(initial).id,
  );
  const [sheet, setSheet] = useState(false);
  const onTraded = useCallback((m: Market) => setMarket(m), []);
  const primary = primaryOutcome(market);
  const ordered = [...market.outcomes].sort((a, b) => b.price - a.price);
  const yes = market.outcomes.find((o) => o.id === "yes");
  const no = market.outcomes.find((o) => o.id === "no");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="space-y-5">
        {market.kind === "binary" ? (
          <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Current odds</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-5xl font-bold tabular tracking-tight text-yes">{formatPct(primary.price)}</span>
                <span className="text-sm font-medium text-muted">chance of Yes</span>
              </p>
              <ChangeChip delta={market.change24h} size="md" className="mt-2" />
            </div>
            <div className="w-full sm:w-64">
              <div className="mb-1.5 flex justify-between text-xs font-semibold">
                <span className="text-yes">Yes {formatCents(yes?.price ?? 0)}</span>
                <span className="text-no">No {formatCents(no?.price ?? 0)}</span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-no-soft">
                <div className="h-full rounded-full bg-yes transition-[width] duration-500" style={{ width: `${(yes?.price ?? 0) * 100}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Outcomes</h2>
              <ChangeChip delta={market.change24h} />
            </div>
            <ul className="space-y-1">
              {ordered.map((o, i) => {
                const on = o.id === selected;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(o.id)}
                      aria-pressed={on}
                      className={cn("grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-1.5 rounded-xl px-3 py-2 text-left transition-colors", on ? "bg-surface-2" : "hover:bg-surface-2")}
                    >
                      <span className="flex items-center gap-2 truncate text-sm font-medium">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: outcomeColor(i) }} />
                        {o.label}
                      </span>
                      <span className="text-sm font-bold tabular">{formatPct(o.price)}</span>
                      <span className="text-xs font-semibold tabular text-muted">{formatCents(o.price)}</span>
                      <ProgressBar value={o.price} color={outcomeColor(i)} className="col-span-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <PriceChart history={market.history} outcomes={market.outcomes} kind={market.kind} selected={selected} onSelect={setSelected} />
      </div>

      <div className="hidden lg:sticky lg:top-20 lg:block">
        <TradePanel market={market} selected={selected} onSelect={setSelected} onTraded={onTraded} closed={closed} idPrefix="trade-desktop" />
      </div>

      {/* Mobile: primary action stays reachable above the bottom nav instead of being buried at the page end. */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden">
        {market.kind === "binary" && yes && no ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { setSelected("yes"); setSheet(true); }} className="h-11 rounded-xl bg-yes text-sm font-bold text-white">
              Buy Yes · {formatCents(yes.price)}
            </button>
            <button type="button" onClick={() => { setSelected("no"); setSheet(true); }} className="h-11 rounded-xl bg-no text-sm font-bold text-white">
              Buy No · {formatCents(no.price)}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setSheet(true)} className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-brand-fg">
            Trade · {market.outcomes.find((o) => o.id === selected)?.label} {formatCents(market.outcomes.find((o) => o.id === selected)?.price ?? 0)}
          </button>
        )}
      </div>
      <Modal open={sheet} onClose={() => setSheet(false)} position="sheet" hideClose className="p-0 [&>div:last-child]:p-0">
        <TradePanel market={market} selected={selected} onSelect={setSelected} onTraded={(m) => { onTraded(m); setSheet(false); }} closed={closed} idPrefix="trade-sheet" className="rounded-none border-0 shadow-none" />
      </Modal>
    </div>
  );
}
