import { fail, handle, ok } from "@/lib/api";
import { toggleWatchlist } from "@/lib/repo";
import { ensureSessionId } from "@/lib/session";

export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { slug?: string } | null;
  if (!body?.slug) return fail("slug is required");
  const id = await ensureSessionId();
  return ok(await toggleWatchlist(id, body.slug));
});
