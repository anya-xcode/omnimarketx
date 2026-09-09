"use client";

import { useEffect, useRef, useState } from "react";
import { formatCompact, formatMoney } from "@/lib/format";

const FORMATS = {
  money: (n: number) => formatMoney(n),
  compact: (n: number) => formatCompact(Math.round(n)),
  integer: (n: number) => Math.round(n).toLocaleString("en-US"),
} as const;

/**
 * Counts from ~60% of the value up to the value after mount. Server and first client paint
 * render the final value (no hydration mismatch); reduced-motion users never see the animation.
 * `kind` is a string so the component can be used from server components.
 */
export function CountUp({ value, kind = "integer", duration = 900 }: { value: number; kind?: keyof typeof FORMATS; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame.current = requestAnimationFrame(() => setDisplay(value));
      return () => {
        if (frame.current) cancelAnimationFrame(frame.current);
      };
    }
    const start = performance.now();
    const from = value * 0.6;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  return <span className="tabular">{FORMATS[kind](display)}</span>;
}
