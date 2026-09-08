import { clamp } from "./utils";
import type { Market, Outcome, PricePoint, TradeSide } from "./types";

export const MIN_PRICE = 0.01;
export const MAX_PRICE = 0.99;

/** Primary outcome: "yes" for binary markets, highest-priced outcome for multi-outcome markets. */
export function primaryOutcome(m: Pick<Market, "kind" | "outcomes">): Outcome {
  if (m.kind === "binary") return m.outcomes.find((o) => o.id === "yes") ?? m.outcomes[0];
  return [...m.outcomes].sort((a, b) => b.price - a.price)[0];
}

export function outcomeById(m: Pick<Market, "outcomes">, id: string) {
  return m.outcomes.find((o) => o.id === id);
}

/** Number of shares purchasable for `amount` at `price` (each share pays $1 if the outcome wins). */
export function sharesForAmount(amount: number, price: number) {
  if (amount <= 0 || price <= 0) return 0;
  return amount / price;
}

export function payoutForShares(shares: number) {
  return shares;
}

export function quote(amount: number, price: number) {
  const shares = sharesForAmount(amount, price);
  const payout = payoutForShares(shares);
  const profit = payout - amount;
  const roi = amount > 0 ? profit / amount : 0;
  return { shares, payout, profit, roi, avgPrice: price };
}

/**
 * Small price-impact model: a buy moves the outcome price up proportionally to
 * trade size vs liquidity; a sell moves it down. Other outcomes are re-normalised
 * so the book still sums to ~1.
 */
export function applyTradeToOutcomes(
  outcomes: Outcome[],
  outcomeId: string,
  side: TradeSide,
  amount: number,
  liquidity: number,
  kind: Market["kind"],
): Outcome[] {
  const impact = clamp(amount / Math.max(liquidity, 1), 0, 0.25);
  const direction = side === "buy" ? 1 : -1;
  const next = outcomes.map((o) => ({ ...o }));
  const target = next.find((o) => o.id === outcomeId);
  if (!target) return outcomes;

  const room = direction > 0 ? 1 - target.price : target.price;
  const delta = direction * impact * room * 0.5;
  target.price = clamp(Number((target.price + delta).toFixed(4)), MIN_PRICE, MAX_PRICE);

  if (kind === "binary") {
    const other = next.find((o) => o.id !== outcomeId);
    if (other) other.price = clamp(Number((1 - target.price).toFixed(4)), MIN_PRICE, MAX_PRICE);
    return next;
  }

  const others = next.filter((o) => o.id !== outcomeId);
  const remaining = clamp(1 - target.price, MIN_PRICE * others.length, 1);
  const sum = others.reduce((s, o) => s + o.price, 0) || 1;
  for (const o of others) o.price = clamp(Number(((o.price / sum) * remaining).toFixed(4)), MIN_PRICE, MAX_PRICE);
  return next;
}

export function isMarketClosed(m: Pick<Market, "status" | "closesAt">, now = Date.now()) {
  return m.status !== "open" || new Date(m.closesAt).getTime() <= now;
}

export function changeBetween(history: PricePoint[], outcomeId: string, sinceMs: number) {
  if (history.length < 2) return 0;
  const last = history[history.length - 1];
  const cutoff = last.t - sinceMs;
  let base = history[0];
  for (const pt of history) {
    if (pt.t <= cutoff) base = pt;
    else break;
  }
  return (last.p[outcomeId] ?? 0) - (base.p[outcomeId] ?? 0);
}
