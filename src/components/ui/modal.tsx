"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  position = "center",
  className,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** `sheet` slides up from the bottom on small screens and centres on larger ones. */
  position?: "center" | "sheet" | "top";
  className?: string;
  hideClose?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const first = panelRef.current?.querySelector<HTMLElement>("input,button,[tabindex]");
    first?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[80] flex bg-black/50 backdrop-blur-[2px] animate-[fade-up_0.15s_ease-out]",
        position === "center" && "items-center justify-center p-4",
        position === "sheet" && "items-end justify-center sm:items-center sm:p-4",
        position === "top" && "items-start justify-center p-4 pt-[10vh]",
      )}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={cn(
          "card relative w-full max-h-[92dvh] overflow-y-auto shadow-pop",
          position === "sheet" ? "max-w-lg rounded-b-none sm:rounded-b-[18px]" : "max-w-lg",
          className,
        )}
      >
        {(title || !hideClose) && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3.5">
            <h2 className="text-base font-bold">{title}</h2>
            {!hideClose && (
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text">
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
