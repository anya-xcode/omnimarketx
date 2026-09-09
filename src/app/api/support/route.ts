import { fail, handle, ok } from "@/lib/api";
import { createSupportTicket } from "@/lib/repo";
import { ensureSessionId } from "@/lib/session";
import { SUPPORT_HOURS } from "@/data/support-faq";

/** Hand-off to a human: stores a ticket and tells the visitor when to expect a reply. */
export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { email?: string; message?: string; transcript?: string[] } | null;
  if (!body?.message) return fail("Please describe your question");
  const userId = await ensureSessionId();
  const ticket = await createSupportTicket({ userId, email: body.email ?? "", message: body.message, transcript: body.transcript ?? [] });
  return ok({ ticket, replyWithin: SUPPORT_HOURS.replyWithin, hours: `${SUPPORT_HOURS.open}-${SUPPORT_HOURS.close} ${SUPPORT_HOURS.timezone}` }, { status: 201 });
});
