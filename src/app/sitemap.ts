import type { MetadataRoute } from "next";
import { listMarkets } from "@/lib/repo";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const markets = await listMarkets({ limit: 60, sort: "volume" });
  const statics: MetadataRoute.Sitemap = ["", "/markets", "/trending", "/categories", "/leaderboard", "/feed", "/blog", "/subscription"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: p === "" || p === "/markets" ? "hourly" : "daily",
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...statics,
    ...markets.items.map((m) => ({ url: `${base}/markets/${m.slug}`, changeFrequency: "hourly" as const, priority: 0.7 })),
  ];
}
