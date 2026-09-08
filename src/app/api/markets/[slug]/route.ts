import { fail, handle, ok } from "@/lib/api";
import { getMarket } from "@/lib/repo";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/markets/[slug]">) => {
  const { slug } = await ctx.params;
  const market = await getMarket(slug);
  if (!market) return fail("Market not found", 404);
  return ok(market);
});
