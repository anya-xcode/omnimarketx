"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { LOCALES, type Locale } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { api } from "@/store/session";

export async function saveLocale(locale: Locale) {
  await api("/api/locale", { method: "POST", body: JSON.stringify({ locale }) });
}

/** Globe dropdown for the top bar. Persists the choice and re-renders the page in the new language. */
export function LocaleSwitcher({ className, variant = "icon" }: { className?: string; variant?: "icon" | "full" }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.id === locale)!;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (id: Locale) => {
    setOpen(false);
    if (id === locale) return;
    startTransition(async () => {
      await saveLocale(id);
      router.refresh();
    });
  };

  return (
    <div ref={ref} className={cn("relative", className)} data-tour="settings">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("top.language")}
        className={cn(
          "flex items-center gap-1.5 rounded-xl text-muted hover:bg-surface-2 hover:text-text",
          variant === "icon" ? "size-9 justify-center" : "h-9 px-3 text-sm font-semibold",
          pending && "opacity-60",
        )}
      >
        <Globe className="size-[18px]" />
        {variant === "full" && <span>{current.native}</span>}
        {variant === "icon" && <span className="sr-only">{current.native}</span>}
      </button>
      {open && (
        <ul role="listbox" aria-label={t("top.language")} className="card absolute right-0 z-50 mt-1 w-48 overflow-hidden p-1 shadow-pop">
          {LOCALES.map((l) => (
            <li key={l.id} role="option" aria-selected={l.id === locale}>
              <button
                type="button"
                onClick={() => choose(l.id)}
                className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm", l.id === locale ? "bg-brand-soft text-brand" : "hover:bg-surface-2")}
              >
                <span aria-hidden>{l.flag}</span>
                <span className="flex-1">
                  <span className="block font-medium">{l.native}</span>
                  <span className="block text-[11px] text-muted">{l.label}</span>
                </span>
                {l.id === locale && <Check className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Plain select for forms (sign-in modal). */
export function LocaleSelect({ value, onChange, id }: { value: Locale; onChange: (l: Locale) => void; id?: string }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as Locale)} className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand">
      {LOCALES.map((l) => (
        <option key={l.id} value={l.id}>
          {l.flag} {l.native} · {l.label}
        </option>
      ))}
    </select>
  );
}
