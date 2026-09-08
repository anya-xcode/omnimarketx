import { handle, ok } from "@/lib/api";
import { getPositions, getUser } from "@/lib/repo";
import { getSessionId } from "@/lib/session";

export const GET = handle(async () => {
  const id = await getSessionId();
  const [user, positions] = await Promise.all([getUser(id), id ? getPositions(id) : Promise.resolve([])]);
  return ok({ user, positions }, { headers: { "Cache-Control": "no-store" } });
});
