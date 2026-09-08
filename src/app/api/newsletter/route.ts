import { fail, handle, ok } from "@/lib/api";
import { subscribe } from "@/lib/repo";

export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  if (!body?.email) return fail("Email is required");
  await subscribe(body.email);
  return ok({ subscribed: true });
});
