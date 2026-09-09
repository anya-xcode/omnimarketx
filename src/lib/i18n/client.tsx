"use client";

import { createContext, useContext, useMemo } from "react";
import { getDictionary, makeT, type Locale, type Translate } from "./index";

interface I18nValue {
  locale: Locale;
  t: Translate;
}

const I18nContext = createContext<I18nValue>({ locale: "en", t: makeT(getDictionary("en")) });

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo<I18nValue>(() => ({ locale, t: makeT(getDictionary(locale)) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Translator + current locale for client components. */
export function useI18n() {
  return useContext(I18nContext);
}
