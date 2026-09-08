import { fail, handle, ok } from "@/lib/api";
import { ensureUser, updateUserName } from "@/lib/repo";
import { ensureSessionId } from "@/lib/session";

/** Returns (and lazily creates) the visitor's demo account. */
export const GET = handle(async () => {
  const id = await ensureSessionId();
  const user = await ensureUser(id);
  return ok(user, { headers: { "Cache-Control": "no-store" } });
});

/** "Sign in" for the demo: choose a display name. */
export const PATCH = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  if (!body?.name) return fail("Name is required");
  const id = await ensureSessionId();
  return ok(await updateUserName(id, body.name));
});
