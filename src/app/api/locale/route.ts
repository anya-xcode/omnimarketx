import { cookies } from "next/headers";
import { fail, handle, ok } from "@/lib/api";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";

/** Persist the visitor's interface language. */
export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { locale?: string } | null;
  if (!isLocale(body?.locale)) return fail("Unsupported locale");
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, body.locale, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return ok({ locale: body.locale });
});
