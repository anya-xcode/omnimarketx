import "server-only";
import { connectDb, hasDatabase } from "./db";
import { getMemoryStore } from "./memory-store";
import { filterMarkets, toSummary } from "./market-query";
import { applyTradeToOutcomes, changeBetween, isMarketClosed, outcomeById, primaryOutcome } from "./pricing";
import { buildPositions } from "./positions";
import { uid } from "./utils";
import type {
  BlogPost,
  CategoryId,
  FeedPost,
  Group,
  Market,
  MarketQuery,
  MarketSummary,
  Paginated,
  Position,
  Trade,
  TradeSide,
  Trader,
  User,
} from "./types";
import { buildSeedMarkets, SEED_BLOG, SEED_FEED, SEED_GROUPS, SEED_TRADERS } from "@/data/seed";

export class RepoError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const STARTING_BALANCE = 10_000;
/** Lean documents must be plain JSON before they cross into client components. */
const NO_ID = { _id: 0 } as const;

/* ------------------------------------------------------------------ */
/* Mongo bootstrap                                                     */
/* ------------------------------------------------------------------ */

let seededPromise: Promise<void> | null = null;

async function models() {
  await connectDb();
  const m = await import("./models");
  if (!seededPromise) {
    seededPromise = (async () => {
      const count = await m.MarketModel.estimatedDocumentCount();
      if (count === 0) await seedDatabase();
    })().catch((err) => {
      seededPromise = null;
      throw err;
    });
  }
  await seededPromise;
  return m;
}

/**
 * Seed MongoDB with the canonical dataset. Uses upserts keyed on the natural id so it is
 * idempotent and safe to run concurrently (e.g. several build workers hitting an empty DB).
 * Pass `reset: true` (the `npm run seed` script) to wipe and re-insert everything.
 */
export async function seedDatabase(opts: { reset?: boolean } = {}) {
  await connectDb();
  const m = await import("./models");
  if (opts.reset) {
    await Promise.all([
      m.MarketModel.deleteMany({}),
      m.FeedPostModel.deleteMany({}),
      m.TraderModel.deleteMany({}),
      m.BlogPostModel.deleteMany({}),
      m.GroupModel.deleteMany({}),
    ]);
  }
  const upserts = <T extends object>(docs: T[], key: keyof T & string) =>
    docs.map((doc) => ({ updateOne: { filter: { [key]: doc[key] }, update: { $setOnInsert: doc }, upsert: true } }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const write = (model: { bulkWrite: (ops: any[], o: { ordered: boolean }) => Promise<unknown> }, ops: unknown[]) => model.bulkWrite(ops, { ordered: false });
  await write(m.MarketModel, upserts(buildSeedMarkets(), "slug"));
  await write(m.FeedPostModel, upserts(SEED_FEED, "id"));
  await write(m.TraderModel, upserts(SEED_TRADERS, "id"));
  await write(m.BlogPostModel, upserts(SEED_BLOG, "slug"));
  await write(m.GroupModel, upserts(SEED_GROUPS, "id"));
}

/* ------------------------------------------------------------------ */
/* Markets                                                             */
/* ------------------------------------------------------------------ */

async function loadOpenMarkets(query: Pick<MarketQuery, "category" | "q">): Promise<Market[]> {
  if (!hasDatabase()) return getMemoryStore().markets;
  const m = await models();
  const cond: Record<string, unknown> = { status: "open" };
  if (query.category && query.category !== "all") cond.category = query.category;
  if (query.q) {
    const rx = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    cond.$or = [{ title: rx }, { subtitle: rx }, { tags: rx }, { "outcomes.label": rx }];
  }
  return m.MarketModel.find(cond, { _id: 0, history: { $slice: -30 } }).lean<Market[]>();
}

export async function listMarkets(query: MarketQuery): Promise<Paginated<MarketSummary>> {
  const all = await loadOpenMarkets(query);
  const filtered = filterMarkets(all, query);
  const limit = query.limit ?? 12;
  const offset = query.offset ?? 0;
  const page = filtered.slice(offset, offset + limit).map(toSummary);
  const nextOffset = offset + limit < filtered.length ? offset + limit : null;
  return { items: page, total: filtered.length, nextOffset };
}

export async function getMarket(slug: string): Promise<Market | null> {
  if (!hasDatabase()) return getMemoryStore().markets.find((m) => m.slug === slug) ?? null;
  const m = await models();
  return m.MarketModel.findOne({ slug }, NO_ID).lean<Market>();
}

export async function getMarketsBySlugs(slugs: string[]): Promise<MarketSummary[]> {
  if (slugs.length === 0) return [];
  if (!hasDatabase()) {
    const set = new Set(slugs);
    return getMemoryStore().markets.filter((m) => set.has(m.slug)).map(toSummary);
  }
  const m = await models();
  const docs = await m.MarketModel.find({ slug: { $in: slugs } }, { _id: 0, history: { $slice: -30 } }).lean<Market[]>();
  return docs.map(toSummary);
}

export async function getFeaturedMarkets(limit = 4): Promise<MarketSummary[]> {
  const all = await loadOpenMarkets({});
  return filterMarkets(all, { sort: "trending" })
    .filter((m) => m.featured)
    .slice(0, limit)
    .map(toSummary);
}

export async function getTrendingMarkets(limit = 10, category?: CategoryId | "all"): Promise<MarketSummary[]> {
  const all = await loadOpenMarkets({ category });
  return filterMarkets(all, { sort: "trending", category }).slice(0, limit).map(toSummary);
}

export async function getMovers(limit = 6): Promise<MarketSummary[]> {
  const all = await loadOpenMarkets({});
  return [...all]
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, limit)
    .map(toSummary);
}

export async function getRelatedMarkets(market: Market, limit = 3): Promise<MarketSummary[]> {
  const all = await loadOpenMarkets({ category: market.category });
  return filterMarkets(all, { sort: "volume", category: market.category })
    .filter((m) => m.slug !== market.slug)
    .slice(0, limit)
    .map(toSummary);
}

export async function getPlatformStats() {
  const all = await loadOpenMarkets({});
  const volume = all.reduce((s, m) => s + m.volume, 0);
  const traders = all.reduce((s, m) => s + m.traders, 0);
  return { markets: all.length, volume, traders };
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export async function getFeed(limit = 6): Promise<FeedPost[]> {
  if (!hasDatabase()) return [...getMemoryStore().feed].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  const m = await models();
  return m.FeedPostModel.find({}, NO_ID).sort({ createdAt: -1 }).limit(limit).lean<FeedPost[]>();
}

export async function createPost(user: User, body: string, marketSlug?: string): Promise<FeedPost> {
  const text = body.trim();
  if (text.length < 3 || text.length > 500) throw new RepoError("Post must be between 3 and 500 characters");
  const post: FeedPost = {
    id: uid("post"),
    author: { name: user.name, handle: user.handle, avatarColor: "#f0286b" },
    body: text,
    marketSlug,
    likes: 0,
    comments: 0,
    reposts: 0,
    createdAt: new Date().toISOString(),
  };
  if (!hasDatabase()) {
    getMemoryStore().feed.unshift(post);
    return post;
  }
  const m = await models();
  await m.FeedPostModel.create(post);
  return post;
}

export async function getTraders(category?: CategoryId | "all", sort: "roi" | "pnl" | "volume" | "winRate" = "roi"): Promise<Trader[]> {
  let list: Trader[];
  if (!hasDatabase()) list = getMemoryStore().traders;
  else {
    const m = await models();
    list = await m.TraderModel.find({}, NO_ID).lean<Trader[]>();
  }
  if (category && category !== "all") list = list.filter((t) => t.categories.includes(category));
  return [...list].sort((a, b) => b[sort] - a[sort]);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!hasDatabase()) return getMemoryStore().blog;
  const m = await models();
  return m.BlogPostModel.find({}, NO_ID).sort({ publishedAt: -1 }).lean<BlogPost[]>();
}

export async function getGroups(): Promise<Group[]> {
  if (!hasDatabase()) return getMemoryStore().groups;
  const m = await models();
  return m.GroupModel.find({}, NO_ID).lean<Group[]>();
}

export async function subscribe(email: string) {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) throw new RepoError("Please enter a valid email address");
  if (!hasDatabase()) {
    getMemoryStore().subscribers.add(e);
    return;
  }
  const m = await models();
  await m.SubscriberModel.updateOne({ email: e }, { $setOnInsert: { email: e, createdAt: new Date().toISOString() } }, { upsert: true });
}

/* ------------------------------------------------------------------ */
/* Users, watchlist, trades                                            */
/* ------------------------------------------------------------------ */

function newUser(id: string): User {
  const short = id.slice(-4).toUpperCase();
  return { id, name: `Trader ${short}`, handle: `trader_${short.toLowerCase()}`, balance: STARTING_BALANCE, createdAt: new Date().toISOString(), watchlist: [] };
}

export async function ensureUser(id: string): Promise<User> {
  if (!hasDatabase()) {
    const store = getMemoryStore();
    let u = store.users.get(id);
    if (!u) {
      u = newUser(id);
      store.users.set(id, u);
    }
    return u;
  }
  const m = await models();
  const existing = await m.UserModel.findOne({ id }, NO_ID).lean<User>();
  if (existing) return existing;
  const u = newUser(id);
  await m.UserModel.create(u);
  return u;
}

export async function getUser(id: string | undefined): Promise<User | null> {
  if (!id) return null;
  if (!hasDatabase()) return getMemoryStore().users.get(id) ?? null;
  const m = await models();
  return m.UserModel.findOne({ id }, NO_ID).lean<User>();
}

export async function updateUserName(id: string, name: string): Promise<User> {
  const clean = name.trim().replace(/\s+/g, " ").slice(0, 40);
  if (clean.length < 2) throw new RepoError("Name must be at least 2 characters");
  const handle = clean.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 20) || "trader";
  const user = await ensureUser(id);
  const next = { ...user, name: clean, handle };
  if (!hasDatabase()) {
    getMemoryStore().users.set(id, next);
    return next;
  }
  const m = await models();
  await m.UserModel.updateOne({ id }, { $set: { name: clean, handle } });
  return next;
}

export async function toggleWatchlist(id: string, slug: string): Promise<string[]> {
  const user = await ensureUser(id);
  const set = new Set(user.watchlist);
  if (set.has(slug)) set.delete(slug);
  else set.add(slug);
  const watchlist = [...set];
  if (!hasDatabase()) {
    getMemoryStore().users.set(id, { ...user, watchlist });
    return watchlist;
  }
  const m = await models();
  await m.UserModel.updateOne({ id }, { $set: { watchlist } });
  return watchlist;
}

export async function getTrades(userId: string, limit = 50): Promise<Trade[]> {
  if (!hasDatabase()) {
    return getMemoryStore()
      .trades.filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
  const m = await models();
  return m.TradeModel.find({ userId }, NO_ID).sort({ createdAt: -1 }).limit(limit).lean<Trade[]>();
}

export async function getRecentActivity(limit = 20): Promise<Trade[]> {
  if (!hasDatabase()) return [...getMemoryStore().trades].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  const m = await models();
  return m.TradeModel.find({}, NO_ID).sort({ createdAt: -1 }).limit(limit).lean<Trade[]>();
}

export async function getPositions(userId: string): Promise<Position[]> {
  const trades = await getTrades(userId, 1000);
  if (trades.length === 0) return [];
  const slugs = [...new Set(trades.map((t) => t.marketSlug))];
  const markets = await getMarketsBySlugs(slugs);
  return buildPositions(trades, new Map(markets.map((m) => [m.slug, m])));
}

export interface PlaceTradeInput {
  userId: string;
  slug: string;
  outcomeId: string;
  side: TradeSide;
  /** USD to spend (buy) */
  amount?: number;
  /** shares to sell (sell) */
  shares?: number;
}

export async function placeTrade(input: PlaceTradeInput): Promise<{ trade: Trade; market: Market; user: User }> {
  const user = await ensureUser(input.userId);
  const market = await getMarket(input.slug);
  if (!market) throw new RepoError("Market not found", 404);
  if (isMarketClosed(market)) throw new RepoError("This market is closed");
  const outcome = outcomeById(market, input.outcomeId);
  if (!outcome) throw new RepoError("Unknown outcome");

  let amount: number;
  let shares: number;
  if (input.side === "buy") {
    amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount < 1) throw new RepoError("Minimum trade is $1");
    if (amount > user.balance) throw new RepoError("Insufficient demo balance");
    shares = amount / outcome.price;
  } else {
    shares = Number(input.shares);
    if (!Number.isFinite(shares) || shares <= 0) throw new RepoError("Enter the number of shares to sell");
    const positions = await getPositions(user.id);
    const pos = positions.find((p) => p.marketSlug === market.slug && p.outcomeId === outcome.id);
    if (!pos || pos.shares + 1e-6 < shares) throw new RepoError("You do not hold enough shares to sell");
    amount = shares * outcome.price;
  }

  const trade: Trade = {
    id: uid("trd"),
    userId: user.id,
    marketSlug: market.slug,
    marketTitle: market.title,
    outcomeId: outcome.id,
    outcomeLabel: outcome.label,
    side: input.side,
    shares: Number(shares.toFixed(4)),
    price: outcome.price,
    amount: Number(amount.toFixed(2)),
    createdAt: new Date().toISOString(),
  };

  const priorTrades = await getTrades(user.id, 1000);
  const firstTradeOnMarket = !priorTrades.some((t) => t.marketSlug === market.slug);
  const outcomes = applyTradeToOutcomes(market.outcomes, outcome.id, input.side, amount, market.liquidity, market.kind);
  const now = Date.now();
  const history = [...market.history, { t: now, p: Object.fromEntries(outcomes.map((o) => [o.id, o.price])) }];
  const primary = primaryOutcome({ kind: market.kind, outcomes });
  const updated: Market = {
    ...market,
    outcomes,
    history,
    volume: market.volume + amount,
    traders: market.traders + (firstTradeOnMarket ? 1 : 0),
    change24h: Number(changeBetween(history, primary.id, 24 * 3_600_000).toFixed(4)),
    trendScore: market.trendScore + Math.round(amount * 5),
  };
  const balance = Number((input.side === "buy" ? user.balance - amount : user.balance + amount).toFixed(2));
  const nextUser = { ...user, balance };

  if (!hasDatabase()) {
    const store = getMemoryStore();
    const idx = store.markets.findIndex((m) => m.slug === market.slug);
    store.markets[idx] = updated;
    store.trades.push(trade);
    store.users.set(user.id, nextUser);
    return { trade, market: updated, user: nextUser };
  }
  const m = await models();
  await m.MarketModel.updateOne(
    { slug: market.slug },
    {
      $set: { outcomes, volume: updated.volume, traders: updated.traders, change24h: updated.change24h, trendScore: updated.trendScore },
      $push: { history: history[history.length - 1] },
    },
  );
  await m.TradeModel.create(trade);
  await m.UserModel.updateOne({ id: user.id }, { $set: { balance } });
  return { trade, market: updated, user: nextUser };
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export async function search(q: string) {
  const term = q.trim().toLowerCase();
  if (term.length < 2) return { markets: [] as MarketSummary[], traders: [] as Trader[] };
  const [marketsPage, traders] = await Promise.all([listMarkets({ q: term, limit: 8, sort: "volume" }), getTraders("all", "roi")]);
  return {
    markets: marketsPage.items,
    traders: traders.filter((t) => t.name.toLowerCase().includes(term) || t.handle.includes(term)).slice(0, 4),
  };
}
