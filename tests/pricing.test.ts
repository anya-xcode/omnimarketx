import { describe, expect, it } from "vitest";
import { applyTradeToOutcomes, changeBetween, isMarketClosed, primaryOutcome, quote, sharesForAmount } from "@/lib/pricing";
import type { Outcome } from "@/lib/types";

const binary: Outcome[] = [
  { id: "yes", label: "Yes", price: 0.62 },
  { id: "no", label: "No", price: 0.38 },
];

describe("quote", () => {
  it("prices shares at $1 payout each", () => {
    const q = quote(100, 0.5);
    expect(q.shares).toBe(200);
    expect(q.payout).toBe(200);
    expect(q.profit).toBe(100);
    expect(q.roi).toBe(1);
  });
  it("returns zero shares for invalid input", () => {
    expect(sharesForAmount(0, 0.5)).toBe(0);
    expect(sharesForAmount(10, 0)).toBe(0);
  });
});

describe("primaryOutcome", () => {
  it("is Yes for binary markets", () => {
    expect(primaryOutcome({ kind: "binary", outcomes: binary }).id).toBe("yes");
  });
  it("is the highest-priced outcome for multi markets", () => {
    const outcomes: Outcome[] = [
      { id: "a", label: "A", price: 0.2 },
      { id: "b", label: "B", price: 0.5 },
      { id: "c", label: "C", price: 0.3 },
    ];
    expect(primaryOutcome({ kind: "multi", outcomes }).id).toBe("b");
  });
});

describe("applyTradeToOutcomes", () => {
  it("moves the bought outcome up and keeps binary prices complementary", () => {
    const next = applyTradeToOutcomes(binary, "yes", "buy", 5_000, 50_000, "binary");
    const yes = next.find((o) => o.id === "yes")!.price;
    const no = next.find((o) => o.id === "no")!.price;
    expect(yes).toBeGreaterThan(0.62);
    expect(yes + no).toBeCloseTo(1, 3);
  });
  it("moves the sold outcome down", () => {
    const next = applyTradeToOutcomes(binary, "yes", "sell", 5_000, 50_000, "binary");
    expect(next.find((o) => o.id === "yes")!.price).toBeLessThan(0.62);
  });
  it("never leaves the 1¢-99¢ band even for huge trades", () => {
    const next = applyTradeToOutcomes(binary, "yes", "buy", 1e9, 10, "binary");
    for (const o of next) {
      expect(o.price).toBeGreaterThanOrEqual(0.01);
      expect(o.price).toBeLessThanOrEqual(0.99);
    }
  });
  it("re-normalises multi-outcome books to sum to ~1", () => {
    const outcomes: Outcome[] = [
      { id: "a", label: "A", price: 0.5 },
      { id: "b", label: "B", price: 0.3 },
      { id: "c", label: "C", price: 0.2 },
    ];
    const next = applyTradeToOutcomes(outcomes, "c", "buy", 10_000, 40_000, "multi");
    const sum = next.reduce((s, o) => s + o.price, 0);
    expect(sum).toBeCloseTo(1, 2);
    expect(next.find((o) => o.id === "c")!.price).toBeGreaterThan(0.2);
  });
  it("ignores unknown outcomes", () => {
    expect(applyTradeToOutcomes(binary, "nope", "buy", 10, 100, "binary")).toBe(binary);
  });
});

describe("changeBetween", () => {
  it("compares the last point with the point at/before the cutoff", () => {
    const h = [
      { t: 0, p: { yes: 0.4 } },
      { t: 50, p: { yes: 0.45 } },
      { t: 100, p: { yes: 0.6 } },
    ];
    expect(changeBetween(h, "yes", 50)).toBeCloseTo(0.15);
    expect(changeBetween(h, "yes", 1000)).toBeCloseTo(0.2);
    expect(changeBetween([h[0]], "yes", 10)).toBe(0);
  });
});

describe("isMarketClosed", () => {
  it("respects status and close time", () => {
    const now = Date.parse("2026-09-08T00:00:00Z");
    expect(isMarketClosed({ status: "open", closesAt: "2026-12-31T00:00:00Z" }, now)).toBe(false);
    expect(isMarketClosed({ status: "open", closesAt: "2026-01-01T00:00:00Z" }, now)).toBe(true);
    expect(isMarketClosed({ status: "resolved", closesAt: "2026-12-31T00:00:00Z" }, now)).toBe(true);
  });
});
