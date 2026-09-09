"use client";

import { Languages } from "lucide-react";
import { localizedTitle } from "@/data/translations";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/**
 * Market title in the visitor's language. When a translation is shown, a small badge
 * marks it and the original is available as a tooltip, so nothing is hidden.
 */
export function LocalizedTitle({ slug, title, className, badge = true }: { slug: string; title: string; className?: string; badge?: boolean }) {
  const { locale, t } = useI18n();
  const r = localizedTitle(slug, title, locale);
  return (
    <span className={className} title={r.translated ? `${t("common.original")}: ${title}` : undefined} lang={r.translated ? locale : "en"}>
      {r.title}
      {badge && r.translated && (
        <span className={cn("ml-1.5 inline-flex translate-y-[-1px] items-center gap-0.5 rounded bg-accent-soft px-1 py-px align-middle text-[10px] font-semibold uppercase tracking-wide text-accent")}>
          <Languages className="size-2.5" aria-hidden /> {t("common.translated")}
        </span>
      )}
    </span>
  );
}

export function useLocalizedTitle(slug: string, title: string) {
  const { locale } = useI18n();
  return localizedTitle(slug, title, locale);
}
