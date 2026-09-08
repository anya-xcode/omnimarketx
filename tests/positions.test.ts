import { describe, expect, it } from "vitest";
import { buildPositions } from "@/lib/positions";
import type { Trade } from "@/lib/types";

const market = {
  slug: "m1",
  title: "Market one",
  category: "crypto" as const,
  closesAt: "2026-12-31T00:00:00Z",
  outcomes: [
    { id: "yes", label: "Yes", price: 0.7 },
    { id: "no", label: "No", price: 0.3 },
  ],
};

function trade(partial: Partial<Trade>): Trade {
  return {
    id: Math.random().toString(36),
    userId: "u1",
    marketSlug: "m1",
    marketTitle: "Market one",
    outcomeId: "yes",
    outcomeLabel: "Yes",
    side: "buy",
    shares: 0,
    price: 0.5,
    amount: 0,
    createdAt: "2026-09-01T00:00:00Z",
    ...partial,
  };
}

describe("buildPositions", () => {
  it("aggregates buys into a position valued at the current price", () => {
    const trades = [trade({ shares: 100, price: 0.5, amount: 50 }), trade({ shares: 50, price: 0.6, amount: 30, createdAt: "2026-09-02T00:00:00Z" })];
    const [p] = buildPositions(trades, new Map([["m1", market]]));
    expect(p.shares).toBe(150);
    expect(p.invested).toBe(80);
    expect(p.avgPrice).toBeCloseTo(80 / 150);
    expect(p.value).toBeCloseTo(105);
    expect(p.pnl).toBeCloseTo(25);
  });
  it("reduces shares and invested proportionally on sells", () => {
    const trades = [trade({ shares: 100, price: 0.5, amount: 50 }), trade({ side: "sell", shares: 50, price: 0.7, amount: 35, createdAt: "2026-09-03T00:00:00Z" })];
    const [p] = buildPositions(trades, new Map([["m1", market]]));
    expect(p.shares).toBe(50);
    expect(p.invested).toBeCloseTo(25);
  });
  it("drops fully-sold positions and unknown markets", () => {
    const trades = [trade({ shares: 10, amount: 5 }), trade({ side: "sell", shares: 10, amount: 7, createdAt: "2026-09-03T00:00:00Z" }), trade({ marketSlug: "ghost", shares: 5, amount: 2 })];
    expect(buildPositions(trades, new Map([["m1", market]]))).toHaveLength(0);
  });
});
