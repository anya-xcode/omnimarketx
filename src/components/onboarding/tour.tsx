"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { create } from "zustand";
import { Compass, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import type { DictKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const DONE_KEY = "omx:tour-done";

interface TourState {
  open: boolean;
  step: number;
  start: () => void;
  close: () => void;
  set: (step: number) => void;
}
export const useTour = create<TourState>((set) => ({
  open: false,
  step: 0,
  start: () => set({ open: true, step: 0 }),
  close: () => set({ open: false }),
  set: (step) => set({ step }),
}));

export function markTourDone() {
  try {
    localStorage.setItem(DONE_KEY, "1");
  } catch {}
}

type Step = { title: DictKey; body: DictKey; target?: string; icon?: "compass" | "grad" };
const STEPS: Step[] = [
  { title: "tour.welcome.title", body: "tour.welcome.body", icon: "compass" },
  { title: "tour.card.title", body: "tour.card.body", target: '[data-tour="market-card"]' },
  { title: "tour.trade.title", body: "tour.trade.body", target: '[data-tour="market-card"] [data-tour="trade-buttons"]' },
  { title: "tour.search.title", body: "tour.search.body", target: '[data-tour="search"]' },
  { title: "tour.portfolio.title", body: "tour.portfolio.body", target: '[data-tour="portfolio"]' },
  { title: "tour.settings.title", body: "tour.settings.body", target: '[data-tour="settings"]' },
  { title: "tour.done.title", body: "tour.done.body", icon: "grad" },
];

function firstVisible(selector: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden") return el;
  }
  return null;
}

/** First-visit guided tour with a spotlight on real UI elements. Replayable from the sidebar and Learn page. */
export function Tour() {
  const { open, step, close, set } = useTour();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [rect, setRect] = useState<DOMRect | null>(null);

  const finish = useCallback(() => {
    markTourDone();
    close();
  }, [close]);
  const next = useCallback(() => (step < STEPS.length - 1 ? set(step + 1) : finish()), [step, set, finish]);
  const back = useCallback(() => {
    if (step > 0) set(step - 1);
  }, [step, set]);

  // Auto-start once, on the home page only.
  useEffect(() => {
    if (pathname !== "/") return;
    let done = "1";
    try {
      done = localStorage.getItem(DONE_KEY) ?? "";
    } catch {}
    if (done) return;
    const id = setTimeout(() => useTour.getState().start(), 900);
    return () => clearTimeout(id);
  }, [pathname]);

  const current = STEPS[step];

  const measure = useCallback(() => {
    if (!open || !current?.target) {
      setRect(null);
      return;
    }
    const el = firstVisible(current.target);
    if (!el) {
      setRect(null);
      return;
    }
    setRect(el.getBoundingClientRect());
  }, [open, current]);

  useLayoutEffect(() => {
    if (!open) return;
    const el = current?.target ? firstVisible(current.target) : null;
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const id = setTimeout(measure, 420);
      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure, true);
      return () => {
        clearTimeout(id);
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure, true);
      };
    }
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [open, step, current, measure]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, finish, next, back]);

  if (!open || !current) return null;

  const pad = 8;
  const spot = rect ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 } : null;
  const placeBelow = spot ? spot.top + spot.height + 240 < window.innerHeight : false;
  const cardStyle: React.CSSProperties | undefined = spot
    ? {
        top: placeBelow ? spot.top + spot.height + 12 : Math.max(12, spot.top - 12 - 230),
        left: Math.min(Math.max(12, spot.left), Math.max(12, window.innerWidth - 360 - 12)),
      }
    : undefined;
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label={t(current.title)}>
      {spot ? (
        <div
          className="absolute rounded-xl ring-2 ring-brand transition-all duration-300"
          style={{ ...spot, boxShadow: "0 0 0 9999px rgba(5,7,15,0.62)" }}
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-black/60" aria-hidden />
      )}

      <div
        className={cn("card absolute w-[min(360px,calc(100vw-24px))] p-5 shadow-pop animate-fade-up", !spot && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", spot && "max-sm:!left-3 max-sm:!top-auto max-sm:bottom-20 max-sm:w-[calc(100vw-24px)]")}
        style={cardStyle}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {current.icon && (
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                {current.icon === "compass" ? <Compass className="size-5" /> : <GraduationCap className="size-5" />}
              </span>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{t("tour.stepOf", { a: step + 1, b: STEPS.length })}</p>
              <h2 className="text-base font-bold leading-tight">{t(current.title)}</h2>
            </div>
          </div>
          <button type="button" onClick={finish} aria-label={t("common.close")} className="rounded-lg p-1 text-faint hover:bg-surface-2 hover:text-text">
            <X className="size-4" />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-muted">{t(current.body)}</p>
        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-brand" : "w-1.5 bg-border-strong")} />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          {last ? (
            <Button variant="outline" size="sm" onClick={() => { finish(); router.push("/learn"); }}>
              <GraduationCap className="size-4" /> {t("tour.goLearn")}
            </Button>
          ) : (
            <button type="button" onClick={finish} className="text-xs font-semibold text-muted hover:text-text">
              {t("common.skip")}
            </button>
          )}
          <div className="flex gap-2">
            {step > 0 && !last && (
              <Button variant="ghost" size="sm" onClick={back}>
                {t("common.back")}
              </Button>
            )}
            <Button size="sm" onClick={last ? () => { finish(); router.push("/markets"); } : next}>
              {last ? t("tour.startTrading") : t("common.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small "Take the tour" trigger for menus. */
export function TourButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      onClick={() => {
        if (pathname !== "/") router.push("/");
        setTimeout(() => useTour.getState().start(), pathname !== "/" ? 500 : 0);
      }}
      className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text", className)}
    >
      <Compass className="size-[18px] text-faint" /> {t("nav.takeTour")}
    </button>
  );
}
