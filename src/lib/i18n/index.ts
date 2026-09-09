import { en, type DictKey, type Dictionary } from "./dictionaries/en";
import { zh } from "./dictionaries/zh";
import { ms } from "./dictionaries/ms";
import { hi } from "./dictionaries/hi";

export const LOCALES = [
  { id: "en", label: "English", native: "English", flag: "🇬🇧" },
  { id: "zh", label: "Chinese", native: "中文", flag: "🇨🇳" },
  { id: "ms", label: "Malay", native: "Bahasa Melayu", flag: "🇲🇾" },
  { id: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
] as const;

export type Locale = (typeof LOCALES)[number]["id"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "omx_locale";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && LOCALES.some((l) => l.id === v);
}

const PARTIALS: Record<Locale, Partial<Dictionary>> = { en: {}, zh, ms, hi };

/** Full dictionary for a locale: locale strings over the English base. */
export function getDictionary(locale: Locale): Dictionary {
  return { ...en, ...PARTIALS[locale] } as Dictionary;
}

export type Translate = (key: DictKey, vars?: Record<string, string | number>) => string;

export function makeT(dict: Dictionary): Translate {
  return (key, vars) => {
    let s = dict[key] ?? en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}

/** Locale-aware "time left" string built from the dictionary. */
export function timeUntilLocalized(t: Translate, iso: string | Date, now = new Date()) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const ms = d.getTime() - now.getTime();
  if (ms <= 0) return t("common.closed");
  const days = Math.floor(ms / 86_400_000);
  if (days >= 60) return t("markets.timeLeft.months", { n: Math.round(days / 30) });
  if (days === 1) return t("markets.timeLeft.day");
  if (days >= 1) return t("markets.timeLeft.days", { n: days });
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return t("markets.timeLeft.hours", { n: hours });
}

export type { DictKey, Dictionary };
