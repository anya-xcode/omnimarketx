import { fail, handle, ok } from "@/lib/api";
import { getMarketsBySlugs, getUser, toggleWatchlist } from "@/lib/repo";
import { ensureSessionId, getSessionId } from "@/lib/session";

/** Starred markets for the current visitor, as summaries. */
export const GET = handle(async () => {
  const id = await getSessionId();
  const user = await getUser(id);
  if (!user || user.watchlist.length === 0) return ok([], { headers: { "Cache-Control": "no-store" } });
  return ok(await getMarketsBySlugs(user.watchlist), { headers: { "Cache-Control": "no-store" } });
});

export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { slug?: string } | null;
  if (!body?.slug) return fail("slug is required");
  const id = await ensureSessionId();
  return ok(await toggleWatchlist(id, body.slug));
});
