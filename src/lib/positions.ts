import type { Market, Position, Trade } from "./types";

/** Aggregate a user's trades into open positions, valued at current market prices. */
export function buildPositions(trades: Trade[], markets: Map<string, Pick<Market, "slug" | "title" | "category" | "closesAt" | "outcomes">>): Position[] {
  const acc = new Map<string, { shares: number; invested: number; label: string }>();
  for (const t of [...trades].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const key = `${t.marketSlug}::${t.outcomeId}`;
    const cur = acc.get(key) ?? { shares: 0, invested: 0, label: t.outcomeLabel };
    if (t.side === "buy") {
      cur.shares += t.shares;
      cur.invested += t.amount;
    } else {
      const ratio = cur.shares > 0 ? Math.min(1, t.shares / cur.shares) : 0;
      cur.invested -= cur.invested * ratio;
      cur.shares = Math.max(0, cur.shares - t.shares);
    }
    acc.set(key, cur);
  }
  const positions: Position[] = [];
  for (const [key, v] of acc) {
    if (v.shares <= 1e-6) continue;
    const [slug, outcomeId] = key.split("::");
    const m = markets.get(slug);
    if (!m) continue;
    const currentPrice = m.outcomes.find((o) => o.id === outcomeId)?.price ?? 0;
    const value = v.shares * currentPrice;
    positions.push({
      marketSlug: slug,
      marketTitle: m.title,
      category: m.category,
      closesAt: m.closesAt,
      outcomeId,
      outcomeLabel: v.label,
      shares: v.shares,
      avgPrice: v.shares > 0 ? v.invested / v.shares : 0,
      currentPrice,
      invested: v.invested,
      value,
      pnl: value - v.invested,
    });
  }
  return positions.sort((a, b) => b.value - a.value);
}
