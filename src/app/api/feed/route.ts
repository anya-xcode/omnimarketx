import { fail, handle, ok } from "@/lib/api";
import { createPost, ensureUser, getFeed } from "@/lib/repo";
import { ensureSessionId } from "@/lib/session";

export const GET = handle(async (req: Request) => {
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 10);
  return ok(await getFeed(Math.min(50, Math.max(1, limit || 10))));
});

export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { body?: string; marketSlug?: string } | null;
  if (!body?.body) return fail("Post body is required");
  const id = await ensureSessionId();
  const user = await ensureUser(id);
  return ok(await createPost(user, body.body, body.marketSlug), { status: 201 });
});
