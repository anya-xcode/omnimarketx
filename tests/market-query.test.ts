import { describe, expect, it } from "vitest";
import { buildSeedMarkets } from "@/data/seed";
import { filterMarkets, parseMarketQuery, toSummary } from "@/lib/market-query";
import { primaryOutcome } from "@/lib/pricing";

const NOW = Date.parse("2026-09-08T12:00:00Z");
const markets = buildSeedMarkets(NOW);

describe("parseMarketQuery", () => {
  it("applies safe defaults", () => {
    expect(parseMarketQuery({})).toEqual({ category: "all", q: undefined, sort: "trending", filter: undefined, limit: 12, offset: 0 });
  });
  it("rejects unknown values and clamps limits", () => {
    const q = parseMarketQuery({ category: "nope", sort: "weird", filter: "x", limit: "999", offset: "-3", q: "  btc " });
    expect(q.category).toBe("all");
    expect(q.sort).toBe("trending");
    expect(q.filter).toBeUndefined();
    expect(q.limit).toBe(60);
    expect(q.offset).toBe(0);
    expect(q.q).toBe("btc");
  });
  it("accepts array-valued params", () => {
    expect(parseMarketQuery({ category: ["crypto", "sports"] }).category).toBe("crypto");
  });
});

describe("filterMarkets", () => {
  it("filters by category", () => {
    const out = filterMarkets(markets, { category: "crypto" }, NOW);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((m) => m.category === "crypto")).toBe(true);
  });
  it("searches title, tags and outcome labels", () => {
    expect(filterMarkets(markets, { q: "bitcoin" }, NOW).length).toBeGreaterThan(0);
    expect(filterMarkets(markets, { q: "arsenal" }, NOW).some((m) => m.slug.includes("premier-league"))).toBe(true);
    expect(filterMarkets(markets, { q: "zzzz-no-match" }, NOW)).toHaveLength(0);
  });
  it("sorts by volume, newest, probability and closing", () => {
    const byVol = filterMarkets(markets, { sort: "volume" }, NOW);
    expect(byVol[0].volume).toBeGreaterThanOrEqual(byVol[1].volume);
    const byNew = filterMarkets(markets, { sort: "newest" }, NOW);
    expect(Date.parse(byNew[0].createdAt)).toBeGreaterThanOrEqual(Date.parse(byNew[1].createdAt));
    const byProb = filterMarkets(markets, { sort: "probability" }, NOW);
    expect(primaryOutcome(byProb[0]).price).toBeGreaterThanOrEqual(primaryOutcome(byProb[1]).price);
    const byClose = filterMarkets(markets, { sort: "closing" }, NOW);
    expect(Date.parse(byClose[0].closesAt)).toBeLessThanOrEqual(Date.parse(byClose[1].closesAt));
  });
  it("applies quick filters", () => {
    expect(filterMarkets(markets, { filter: "high-volume" }, NOW).every((m) => m.volume >= 250_000)).toBe(true);
    expect(filterMarkets(markets, { filter: "rising" }, NOW).every((m) => m.change24h > 0)).toBe(true);
    expect(filterMarkets(markets, { filter: "falling" }, NOW).every((m) => m.change24h < 0)).toBe(true);
    expect(filterMarkets(markets, { filter: "closing-soon" }, NOW).every((m) => Date.parse(m.closesAt) - NOW < 45 * 86_400_000)).toBe(true);
  });
});

describe("seed data integrity", () => {
  it("has unique slugs and well-formed prices", () => {
    const slugs = new Set(markets.map((m) => m.slug));
    expect(slugs.size).toBe(markets.length);
    for (const m of markets) {
      const sum = m.outcomes.reduce((s, o) => s + o.price, 0);
      expect(sum).toBeCloseTo(1, 2);
      expect(m.history.length).toBeGreaterThan(30);
      const last = m.history[m.history.length - 1];
      for (const o of m.outcomes) expect(last.p[o.id]).toBe(o.price);
    }
  });
  it("produces summaries with sparklines and without heavy fields", () => {
    const s = toSummary(markets[0]);
    expect(s.spark.length).toBeGreaterThan(10);
    expect("history" in s).toBe(false);
    expect("resolution" in s).toBe(false);
  });
});
