import fs from "node:fs";
import path from "node:path";
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

/** Shape written to disk. Only user-generated state is saved; static content comes from the seed. */
interface Snapshot {
  version: 1;
  savedAt: string;
  markets: Market[];
  feed: FeedPost[];
  trades: Trade[];
  users: User[];
  subscribers: string[];
  tickets: SupportTicket[];
}

declare global {
  var __omxMemoryStore: MemoryStore | undefined;
  var __omxPersistTimer: ReturnType<typeof setTimeout> | undefined;
}

/**
 * Where the no-database store is saved. Defaults to `.data/state.json` in the project.
 * Set OMX_DATA_FILE to move it, or OMX_DATA_FILE=off to keep everything in memory only.
 */
function dataFile(): string | null {
  const v = process.env.OMX_DATA_FILE;
  if (v === "off") return null;
  return v && v.trim() ? v : path.join(process.cwd(), ".data", "state.json");
}

function loadSnapshot(): Snapshot | null {
  const file = dataFile();
  if (!file) return null;
  try {
    if (!fs.existsSync(file)) return null;
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Snapshot;
    return parsed && parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * In-memory store used when MONGODB_URI is not configured (and by unit tests).
 * State is restored from the JSON file on first use and saved after every change,
 * so a plain Node server keeps trades and tickets across restarts with no database.
 * On read-only hosts (serverless) saving fails quietly and the store is memory-only.
 */
export function getMemoryStore(): MemoryStore {
  if (!global.__omxMemoryStore) {
    global.__omxMemoryStore = createMemoryStore(loadSnapshot());
  }
  return global.__omxMemoryStore;
}

export function createMemoryStore(snapshot: Snapshot | null = null): MemoryStore {
  const seedMarkets = buildSeedMarkets();
  const savedBySlug = new Map((snapshot?.markets ?? []).map((m) => [m.slug, m]));
  return {
    // Saved markets carry the prices/volume/history produced by demo trades; new seed markets still appear.
    markets: seedMarkets.map((m) => savedBySlug.get(m.slug) ?? m),
    feed: snapshot?.feed ?? SEED_FEED.map((p) => ({ ...p })),
    traders: SEED_TRADERS.map((t) => ({ ...t })),
    blog: SEED_BLOG.map((b) => ({ ...b })),
    groups: SEED_GROUPS.map((g) => ({ ...g })),
    trades: snapshot?.trades ?? [],
    users: new Map((snapshot?.users ?? []).map((u) => [u.id, u])),
    subscribers: new Set(snapshot?.subscribers ?? []),
    tickets: snapshot?.tickets ?? [],
  };
}

/** Debounced save. Call after any mutation of the memory store. */
export function persistMemoryStore() {
  const file = dataFile();
  if (!file || !global.__omxMemoryStore) return;
  if (global.__omxPersistTimer) clearTimeout(global.__omxPersistTimer);
  global.__omxPersistTimer = setTimeout(() => {
    const s = global.__omxMemoryStore;
    if (!s) return;
    const snap: Snapshot = {
      version: 1,
      savedAt: new Date().toISOString(),
      markets: s.markets,
      feed: s.feed,
      trades: s.trades,
      users: [...s.users.values()],
      subscribers: [...s.subscribers],
      tickets: s.tickets,
    };
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(snap));
      fs.renameSync(tmp, file);
    } catch {
      /* read-only filesystem (e.g. serverless): stay memory-only */
    }
  }, 300);
}

export function resetMemoryStore() {
  global.__omxMemoryStore = createMemoryStore();
  return global.__omxMemoryStore;
}
