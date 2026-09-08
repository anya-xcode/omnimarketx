import { handle, ok } from "@/lib/api";
import { search } from "@/lib/repo";

export const GET = handle(async (req: Request) => {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  return ok(await search(q.slice(0, 80)), { headers: { "Cache-Control": "public, s-maxage=15" } });
});
