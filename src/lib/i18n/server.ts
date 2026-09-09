import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, getDictionary, isLocale, makeT, type Locale } from "./index";

/** Current locale from the preference cookie. Safe in server components. */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

/** Translator for server components. */
export async function getT() {
  const locale = await getLocale();
  return { locale, t: makeT(getDictionary(locale)) };
}
