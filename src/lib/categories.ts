import type { Category, CategoryId } from "./types";

export const CATEGORIES: Category[] = [
  { id: "crypto", label: "Crypto", emoji: "₿", description: "Bitcoin, Ethereum, altcoins and on-chain events", color: "#f59e0b" },
  { id: "politics", label: "Politics", emoji: "🗳️", description: "Elections, policy and geopolitics worldwide", color: "#ef4444" },
  { id: "sports", label: "Sports", emoji: "⚽", description: "Football, cricket, F1, boxing and more", color: "#10b981" },
  { id: "economy", label: "Economy", emoji: "📈", description: "Rates, inflation, commodities and GDP", color: "#3b82f6" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", description: "Box office, awards, music and streaming", color: "#8b5cf6" },
  { id: "tech", label: "Tech", emoji: "🤖", description: "AI launches, gadgets, space and big tech", color: "#06b6d4" },
  { id: "gaming", label: "Gaming", emoji: "🎮", description: "Game launches, esports and collectibles", color: "#ec4899" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === "string" && v in CATEGORY_MAP;
}
