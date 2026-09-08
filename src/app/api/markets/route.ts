import { handle, ok } from "@/lib/api";
import { parseMarketQuery } from "@/lib/market-query";
import { listMarkets } from "@/lib/repo";

export const GET = handle(async (req: Request) => {
  const url = new URL(req.url);
  const query = parseMarketQuery(Object.fromEntries(url.searchParams.entries()));
  const page = await listMarkets(query);
  return ok(page, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } });
});
