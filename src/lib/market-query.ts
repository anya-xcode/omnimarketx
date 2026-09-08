import type { Market, MarketQuery, MarketSummary, QuickFilter, SortKey } from "./types";
import { primaryOutcome } from "./pricing";
import { isCategoryId } from "./categories";

export const SORT_KEYS: SortKey[] = ["trending", "volume", "newest", "probability", "closing"];
export const QUICK_FILTERS: QuickFilter[] = ["high-volume", "rising", "falling", "new", "closing-soon"];

export function parseMarketQuery(sp: Record<string, string | string[] | undefined>): MarketQuery {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const category = one("category");
  const sort = one("sort");
  const filter = one("filter");
  const limit = Number(one("limit"));
  const offset = Number(one("offset"));
  return {
    category: isCategoryId(category) ? category : "all",
    q: (one("q") ?? "").trim().slice(0, 80) || undefined,
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : "trending",
    filter: QUICK_FILTERS.includes(filter as QuickFilter) ? (filter as QuickFilter) : undefined,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 60) : 12,
    offset: Number.isFinite(offset) && offset > 0 ? offset : 0,
  };
}

/** Pure, in-memory implementation of market filtering/sorting. Used by the memory store and unit tests. */
export function filterMarkets(markets: Market[], query: MarketQuery, now = Date.now()): Market[] {
  let list = markets.filter((m) => m.status === "open");
  if (query.category && query.category !== "all") list = list.filter((m) => m.category === query.category);
  if (query.q) {
    const q = query.q.toLowerCase();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.subtitle?.toLowerCase().includes(q) ||
        m.tags.some((t) => t.includes(q)) ||
        m.outcomes.some((o) => o.label.toLowerCase().includes(q)),
    );
  }
  switch (query.filter) {
    case "high-volume":
      list = list.filter((m) => m.volume >= 250_000);
      break;
    case "rising":
      list = list.filter((m) => m.change24h > 0.005);
      break;
    case "falling":
      list = list.filter((m) => m.change24h < -0.005);
      break;
    case "new":
      list = list.filter((m) => now - new Date(m.createdAt).getTime() < 21 * 86_400_000);
      break;
    case "closing-soon":
      list = list.filter((m) => new Date(m.closesAt).getTime() - now < 45 * 86_400_000);
      break;
  }
  const sort: SortKey = query.sort ?? "trending";
  const sorted = [...list].sort((a, b) => {
    switch (sort) {
      case "volume":
        return b.volume - a.volume;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "probability":
        return primaryOutcome(b).price - primaryOutcome(a).price;
      case "closing":
        return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
      default:
        return b.trendScore - a.trendScore;
    }
  });
  return sorted;
}

export function toSummary(m: Market): MarketSummary {
  const primary = primaryOutcome(m);
  const { history, resolution, resolutionSources, ...rest } = m;
  void resolution;
  void resolutionSources;
  const spark = history.slice(-30).map((pt) => pt.p[primary.id] ?? 0);
  return { ...rest, spark };
}
