import { fail, handle, ok } from "@/lib/api";
import { getTrades, placeTrade } from "@/lib/repo";
import { ensureSessionId, getSessionId } from "@/lib/session";

export const GET = handle(async () => {
  const id = await getSessionId();
  if (!id) return ok([]);
  return ok(await getTrades(id));
});

export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as
    | { slug?: string; outcomeId?: string; side?: "buy" | "sell"; amount?: number; shares?: number }
    | null;
  if (!body?.slug || !body.outcomeId || (body.side !== "buy" && body.side !== "sell")) return fail("Invalid trade request");
  const userId = await ensureSessionId();
  const result = await placeTrade({ userId, slug: body.slug, outcomeId: body.outcomeId, side: body.side, amount: body.amount, shares: body.shares });
  return ok(result);
});
