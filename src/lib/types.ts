export type CategoryId =
  | "crypto"
  | "politics"
  | "sports"
  | "economy"
  | "entertainment"
  | "tech"
  | "gaming";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export interface Outcome {
  id: string;
  label: string;
  /** Probability / price between 0.01 and 0.99 */
  price: number;
}

export interface PricePoint {
  /** unix ms */
  t: number;
  /** outcomeId -> price */
  p: Record<string, number>;
}

export type MarketKind = "binary" | "multi";
export type MarketStatus = "open" | "closed" | "resolved";

export interface Market {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: CategoryId;
  kind: MarketKind;
  icon: string;
  outcomes: Outcome[];
  volume: number;
  traders: number;
  liquidity: number;
  /** 24h change of the primary outcome, in probability (0.031 = +3.1 pts) */
  change24h: number;
  createdAt: string;
  closesAt: string;
  status: MarketStatus;
  resolution: string;
  resolutionSources: string[];
  tags: string[];
  featured?: boolean;
  region?: string;
  history: PricePoint[];
  trendScore: number;
}

export type MarketSummary = Omit<Market, "history" | "resolution" | "resolutionSources"> & {
  /** primary-outcome prices for the last ~24 points, for sparklines */
  spark: number[];
};

export interface FeedPost {
  id: string;
  author: { name: string; handle: string; avatarColor: string; verified?: boolean };
  body: string;
  marketSlug?: string;
  likes: number;
  comments: number;
  reposts: number;
  createdAt: string;
}

export interface Trader {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  roi: number;
  pnl: number;
  volume: number;
  winRate: number;
  trades: number;
  streak: number;
  verified?: boolean;
  categories: CategoryId[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  gradient: string;
  emoji: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
  featured?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  category: CategoryId;
  emoji: string;
}

export type TradeSide = "buy" | "sell";

export interface Trade {
  id: string;
  userId: string;
  marketSlug: string;
  marketTitle: string;
  outcomeId: string;
  outcomeLabel: string;
  side: TradeSide;
  shares: number;
  price: number;
  amount: number;
  createdAt: string;
}

export interface Position {
  marketSlug: string;
  marketTitle: string;
  category: CategoryId;
  closesAt: string;
  outcomeId: string;
  outcomeLabel: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  value: number;
  pnl: number;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  balance: number;
  createdAt: string;
  watchlist: string[];
}

export type SortKey = "trending" | "volume" | "newest" | "probability" | "closing";
export type QuickFilter = "high-volume" | "rising" | "falling" | "new" | "closing-soon";

export interface MarketQuery {
  category?: CategoryId | "all";
  q?: string;
  sort?: SortKey;
  limit?: number;
  offset?: number;
  filter?: QuickFilter;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  nextOffset: number | null;
}
