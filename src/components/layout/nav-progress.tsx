"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { create } from "zustand";

interface ProgressState {
  active: boolean;
  start: () => void;
  done: () => void;
}
export const useNavProgress = create<ProgressState>((set) => ({
  active: false,
  start: () => set((s) => (s.active ? s : { active: true })),
  done: () => set((s) => (s.active ? { active: false } : s)),
}));

/** Thin brand-coloured progress bar under the top bar while a page navigation is in flight. */
export function NavProgress() {
  const active = useNavProgress((s) => s.active);
  const start = useNavProgress((s) => s.start);
  const done = useNavProgress((s) => s.done);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [width, setWidth] = useState(0);

  // Start on internal link clicks.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (url.hash && url.pathname === location.pathname) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // Finish whenever the route actually changes.
  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  // All state updates are scheduled (timers), never synchronous inside the effect.
  useEffect(() => {
    if (active) {
      const kick = setTimeout(() => setWidth(12), 0);
      const grow = setInterval(() => setWidth((w) => (w < 85 ? w + Math.max(1, (90 - w) * 0.12) : w)), 180);
      return () => {
        clearTimeout(kick);
        clearInterval(grow);
      };
    }
    const finish = setTimeout(() => setWidth((w) => (w > 0 ? 100 : 0)), 0);
    const hide = setTimeout(() => setWidth(0), 300);
    return () => {
      clearTimeout(finish);
      clearTimeout(hide);
    };
  }, [active]);

  if (width <= 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 lg:left-64" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-brand to-accent transition-[width] duration-200 ease-out"
        style={{ width: `${width}%`, boxShadow: "0 0 8px color-mix(in srgb, var(--brand) 70%, transparent)", animation: "progress-glow 1.2s ease-in-out infinite" }}
      />
    </div>
  );
}
