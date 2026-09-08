import { handle, ok } from "@/lib/api";
import { isCategoryId } from "@/lib/categories";
import { getTraders } from "@/lib/repo";

export const GET = handle(async (req: Request) => {
  const sp = new URL(req.url).searchParams;
  const category = sp.get("category");
  const sort = sp.get("sort");
  const sortKey = (["roi", "pnl", "volume", "winRate"] as const).find((k) => k === sort) ?? "roi";
  return ok(await getTraders(isCategoryId(category) ? category : "all", sortKey), {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
});
