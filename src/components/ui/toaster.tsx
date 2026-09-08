"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToast } from "@/store/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6" aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.variant === "success" ? CheckCircle2 : t.variant === "error" ? XCircle : Info;
        return (
          <div
            key={t.id}
            className={cn("card pointer-events-auto flex w-full max-w-sm items-start gap-3 px-4 py-3 shadow-pop animate-fade-up")}
            role="status"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", t.variant === "success" ? "text-yes" : t.variant === "error" ? "text-no" : "text-accent")} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded p-0.5 text-faint hover:text-text">
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
