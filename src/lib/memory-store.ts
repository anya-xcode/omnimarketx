import { buildSeedMarkets, SEED_BLOG, SEED_FEED, SEED_GROUPS, SEED_TRADERS } from "@/data/seed";
import type { BlogPost, FeedPost, Group, Market, SupportTicket, Trade, Trader, User } from "./types";

export interface MemoryStore {
  markets: Market[];
  feed: FeedPost[];
  traders: Trader[];
  blog: BlogPost[];
  groups: Group[];
  trades: Trade[];
  users: Map<string, User>;
  subscribers: Set<string>;
  tickets: SupportTicket[];
}

declare global {
  var __omxMemoryStore: MemoryStore | undefined;
}

/** In-memory fallback store (used when MONGODB_URI is not configured, and by unit tests). */
export function getMemoryStore(): MemoryStore {
  if (!global.__omxMemoryStore) {
    global.__omxMemoryStore = createMemoryStore();
  }
  return global.__omxMemoryStore;
}

export function createMemoryStore(): MemoryStore {
  return {
    markets: buildSeedMarkets(),
    feed: SEED_FEED.map((p) => ({ ...p })),
    traders: SEED_TRADERS.map((t) => ({ ...t })),
    blog: SEED_BLOG.map((b) => ({ ...b })),
    groups: SEED_GROUPS.map((g) => ({ ...g })),
    trades: [],
    users: new Map(),
    subscribers: new Set(),
    tickets: [],
  };
}

export function resetMemoryStore() {
  global.__omxMemoryStore = createMemoryStore();
  return global.__omxMemoryStore;
}
