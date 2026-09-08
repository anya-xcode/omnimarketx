"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChipLink } from "@/components/ui/primitives";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrollable category filter. Fixes the reference site's overflow problem:
 * scroll-snap, faded edge, and arrow buttons on wider screens so nothing gets cut off silently.
 */
export function CategoryChips({
  active,
  basePath,
  params = {},
  className,
}: {
  active: CategoryId | "all";
  /** Route the chips link to, e.g. "/markets". */
  basePath: string;
  /** Extra query params to preserve (sort, q, filter…). */
  params?: Record<string, string>;
  className?: string;
}) {
  const hrefFor = (id: CategoryId | "all") => {
    const sp = new URLSearchParams(params);
    if (id === "all") sp.delete("category");
    else sp.set("category", id);
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} role="tablist" aria-label="Category" className={cn("flex gap-2 overflow-x-auto scroll-smooth scrollbar-none snap-x", canRight && "fade-edge-x")}>
        <ChipLink href={hrefFor("all")} active={active === "all"} className="snap-start">
          All markets
        </ChipLink>
        {CATEGORIES.map((c) => (
          <ChipLink key={c.id} href={hrefFor(c.id)} active={active === c.id} className="snap-start">
            <span aria-hidden>{c.emoji}</span> {c.label}
          </ChipLink>
        ))}
      </div>
      {canLeft && (
        <button type="button" onClick={() => scrollBy(-1)} aria-label="Scroll categories left" className="absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-surface p-1 shadow-float md:block">
          <ChevronLeft className="size-4" />
        </button>
      )}
      {canRight && (
        <button type="button" onClick={() => scrollBy(1)} aria-label="Scroll categories right" className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-surface p-1 shadow-float md:block">
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
