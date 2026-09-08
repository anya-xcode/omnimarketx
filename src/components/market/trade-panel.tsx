"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/primitives";
import { formatCents, formatMoney, formatPct } from "@/lib/format";
import { quote } from "@/lib/pricing";
import type { Market, Position, Trade, TradeSide, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { api, isSignedIn, useSession } from "@/store/session";
import { toast } from "@/store/toast";
import { outcomeColor } from "./bits";

const QUICK = [10, 50, 100, 500];

export function TradePanel({
  market,
  selected,
  onSelect,
  onTraded,
  closed = false,
  idPrefix,
  className,
}: {
  market: Market;
  selected: string;
  onSelect: (id: string) => void;
  onTraded: (market: Market) => void;
  /** Computed on the server so render stays pure. */
  closed?: boolean;
  /** Unique prefix for form ids when several panels exist (desktop rail + mobile sheet). */
  idPrefix?: string;
  className?: string;
}) {
  const id = (s: string) => `${idPrefix ?? "trade"}-${s}`;
  const router = useRouter();
  const { user, setUser, openAuth } = useSession();
  const [side, setSide] = useState<TradeSide>("buy");
  const [amount, setAmount] = useState("25");
  const [sharesToSell, setSharesToSell] = useState("");
  const [busy, setBusy] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);

  const outcome = market.outcomes.find((o) => o.id === selected) ?? market.outcomes[0];
  const ordered = useMemo(() => [...market.outcomes].sort((a, b) => b.price - a.price), [market.outcomes]);
  const colorOf = (id: string) => outcomeColor(ordered.findIndex((o) => o.id === id), id);
  const position = positions.find((p) => p.marketSlug === market.slug && p.outcomeId === outcome.id);

  useEffect(() => {
    let alive = true;
    api<{ positions: Position[] }>("/api/portfolio")
      .then((d) => alive && setPositions(d.positions))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [market.slug, market.volume]);

  const amt = Number(amount);
  const q = quote(Number.isFinite(amt) ? amt : 0, outcome.price);
  const sell = Number(sharesToSell);
  const sellProceeds = Number.isFinite(sell) ? sell * outcome.price : 0;
  const insufficient = side === "buy" && user ? amt > user.balance : false;

  const submit = async () => {
    setBusy(true);
    try {
      const body = side === "buy" ? { slug: market.slug, outcomeId: outcome.id, side, amount: amt } : { slug: market.slug, outcomeId: outcome.id, side, shares: sell };
      const res = await api<{ trade: Trade; market: Market; user: User }>("/api/trades", { method: "POST", body: JSON.stringify(body) });
      setUser(res.user);
      onTraded(res.market);
      toast({
        title: side === "buy" ? `Bought ${res.trade.shares.toFixed(2)} ${outcome.label} shares` : `Sold ${res.trade.shares.toFixed(2)} ${outcome.label} shares`,
        description: `${formatMoney(res.trade.amount, { compact: false })} at ${formatCents(res.trade.price)} · new price ${formatCents(res.market.outcomes.find((o) => o.id === outcome.id)?.price ?? 0)}`,
        variant: "success",
      });
      if (side === "sell") setSharesToSell("");
      router.refresh();
    } catch (err) {
      toast({ title: "Trade failed", description: err instanceof Error ? err.message : "Please try again", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cn("card overflow-hidden", className)} aria-label="Trade">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Segmented value={side} onChange={setSide} size="sm" ariaLabel="Buy or sell" options={[{ value: "buy", label: "Buy" }, { value: "sell", label: "Sell" }]} />
        <span className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-1 text-[11px] font-semibold text-accent">Demo mode</span>
      </div>

      <div className="space-y-4 p-4">
        {market.kind === "binary" ? (
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Outcome">
            {market.outcomes.map((o) => {
              const on = o.id === outcome.id;
              const yes = o.id === "yes";
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSelect(o.id)}
                  className={cn(
                    "flex flex-col items-center rounded-xl border-2 py-3 transition-colors",
                    on ? (yes ? "border-yes bg-yes-soft text-yes" : "border-no bg-no-soft text-no") : "border-border bg-surface text-muted hover:border-border-strong",
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-wide">{o.label}</span>
                  <span className="text-2xl font-bold tabular">{formatCents(o.price)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1" role="radiogroup" aria-label="Outcome">
            {ordered.map((o) => {
              const on = o.id === outcome.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSelect(o.id)}
                  className={cn("flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors", on ? "border-brand bg-brand-soft" : "border-border hover:border-border-strong")}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: colorOf(o.id) }} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{o.label}</span>
                  <span className="text-sm font-bold tabular">{formatCents(o.price)}</span>
                </button>
              );
            })}
          </div>
        )}

        {closed ? (
          <p className="flex items-center gap-2 rounded-xl bg-surface-2 p-3 text-sm text-muted">
            <Lock className="size-4" /> This market is closed for trading.
          </p>
        ) : side === "buy" ? (
          <>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor={id("amount")} className="text-sm font-semibold">
                  Amount
                </label>
                <span className="text-xs text-muted tabular">Balance {user ? formatMoney(user.balance, { compact: false }) : "…"}</span>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-faint">$</span>
                <input
                  id={id("amount")}
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  aria-invalid={insufficient}
                  className={cn("h-12 w-full rounded-xl border bg-surface pl-8 pr-3 text-xl font-bold tabular outline-none focus:border-brand", insufficient ? "border-no" : "border-border")}
                />
              </div>
              <div className="mt-2 flex gap-1.5">
                {QUICK.map((v) => (
                  <button key={v} type="button" onClick={() => setAmount(String((Number.isFinite(amt) ? amt : 0) + v))} className="flex-1 rounded-lg bg-surface-2 py-1.5 text-xs font-semibold hover:bg-surface-3">
                    +{v}
                  </button>
                ))}
                <button type="button" onClick={() => user && setAmount(String(Math.floor(user.balance)))} className="flex-1 rounded-lg bg-surface-2 py-1.5 text-xs font-semibold hover:bg-surface-3">
                  Max
                </button>
              </div>
              {insufficient && (
                <p className="mt-1.5 text-xs font-medium text-no" role="alert">
                  Exceeds your demo balance.
                </p>
              )}
            </div>

            <dl className="space-y-1.5 rounded-xl bg-surface-2 p-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Avg. price</dt><dd className="font-semibold tabular">{formatCents(outcome.price)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shares</dt><dd className="font-semibold tabular">{q.shares.toFixed(2)}</dd></div>
              <div className="flex justify-between border-t border-border pt-1.5">
                <dt className="text-muted">Potential payout</dt>
                <dd className="font-bold tabular text-yes">{formatMoney(q.payout, { compact: false })} <span className="text-xs font-semibold">(+{formatPct(q.roi)})</span></dd>
              </div>
            </dl>

            <Button size="lg" className="w-full" loading={busy} disabled={!Number.isFinite(amt) || amt < 1 || insufficient} onClick={submit}
              style={{ background: outcome.id === "no" ? "var(--no)" : outcome.id === "yes" ? "var(--yes)" : undefined, color: outcome.id === "yes" || outcome.id === "no" ? "#fff" : undefined }}>
              Buy {outcome.label} · {formatMoney(Number.isFinite(amt) ? amt : 0, { compact: false })}
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-xl bg-surface-2 p-3 text-sm">
              {position ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted">You hold</span>
                  <span className="font-semibold tabular">{position.shares.toFixed(2)} shares @ {formatCents(position.avgPrice)}</span>
                </div>
              ) : (
                <p className="text-muted">You don&apos;t hold any {outcome.label} shares in this market yet.</p>
              )}
            </div>
            {position && (
              <>
                <div>
                  <label htmlFor={id("shares")} className="mb-1.5 block text-sm font-semibold">
                    Shares to sell
                  </label>
                  <input
                    id={id("shares")}
                    inputMode="decimal"
                    value={sharesToSell}
                    onChange={(e) => setSharesToSell(e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="0.00"
                    className="h-12 w-full rounded-xl border border-border bg-surface px-3 text-xl font-bold tabular outline-none focus:border-brand"
                  />
                  <div className="mt-2 flex gap-1.5">
                    {[0.25, 0.5, 0.75, 1].map((f) => (
                      <button key={f} type="button" onClick={() => setSharesToSell((position.shares * f).toFixed(4))} className="flex-1 rounded-lg bg-surface-2 py-1.5 text-xs font-semibold hover:bg-surface-3">
                        {f * 100}%
                      </button>
                    ))}
                  </div>
                </div>
                <dl className="space-y-1.5 rounded-xl bg-surface-2 p-3 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">Sell price</dt><dd className="font-semibold tabular">{formatCents(outcome.price)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">You receive</dt><dd className="font-bold tabular">{formatMoney(sellProceeds, { compact: false })}</dd></div>
                </dl>
                <Button size="lg" variant="secondary" className="w-full" loading={busy} disabled={!Number.isFinite(sell) || sell <= 0 || sell > position.shares + 1e-6} onClick={submit}>
                  Sell {outcome.label}
                </Button>
              </>
            )}
          </>
        )}

        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-faint">
          <Info className="mt-0.5 size-3 shrink-0" />
          <span>
            {isSignedIn(user) ? (
              <>Trading as <strong className="text-muted">{user?.name}</strong>. Prices move with each trade to simulate market impact.</>
            ) : (
              <>
                You&apos;re trading with a demo balance.{" "}
                <button type="button" onClick={openAuth} className="font-semibold text-brand hover:underline">
                  Choose a display name
                </button>{" "}
                to appear on the activity feed.
              </>
            )}
          </span>
        </p>
      </div>
    </section>
  );
}
