"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Segmented } from "@/components/ui/primitives";
import type { Outcome, PricePoint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { outcomeColor } from "./bits";

type Range = "1D" | "1W" | "1M" | "ALL";
const RANGE_MS: Record<Range, number> = { "1D": 86_400_000, "1W": 7 * 86_400_000, "1M": 30 * 86_400_000, ALL: Infinity };

function fmtTime(t: number, range: Range) {
  const d = new Date(t);
  if (range === "1D") return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PriceChart({
  history,
  outcomes,
  kind,
  selected,
  onSelect,
  className,
}: {
  history: PricePoint[];
  outcomes: Outcome[];
  kind: "binary" | "multi";
  selected: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const [range, setRange] = useState<Range>("1M");
  const [visible, setVisible] = useState<string[]>(() =>
    kind === "binary" ? ["yes"] : [...outcomes].sort((a, b) => b.price - a.price).slice(0, 4).map((o) => o.id),
  );

  const data = useMemo(() => {
    const last = history[history.length - 1]?.t ?? 0;
    const cutoff = last - RANGE_MS[range];
    let pts = history.filter((p) => p.t >= cutoff);
    if (range !== "1D") {
      // Collapse the hourly tail into one point per calendar day so the axis doesn't repeat today's date.
      const byDay = new Map<string, PricePoint>();
      for (const p of pts) byDay.set(new Date(p.t).toISOString().slice(0, 10), p);
      pts = [...byDay.values()];
    }
    return (pts.length >= 2 ? pts : history.slice(-2)).map((p) => {
      const row: Record<string, number> = { t: p.t };
      for (const [k, v] of Object.entries(p.p)) row[k] = Math.round(v * 1000) / 10;
      return row;
    });
  }, [history, range]);

  const orderedOutcomes = useMemo(() => [...outcomes].sort((a, b) => b.price - a.price), [outcomes]);
  const colorOf = (id: string) => outcomeColor(orderedOutcomes.findIndex((o) => o.id === id), id);

  const domain = useMemo(() => {
    const vals = data.flatMap((d) => visible.map((id) => d[id] as number)).filter((v) => Number.isFinite(v));
    if (vals.length === 0) return [0, 100];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max(2, (max - min) * 0.25);
    return [Math.max(0, Math.floor(min - pad)), Math.min(100, Math.ceil(max + pad))];
  }, [data, visible]);

  const first = data[0];
  const last = data[data.length - 1];
  const delta = first && last ? (last[selected] as number) - (first[selected] as number) : 0;

  return (
    <div className={cn("card p-4 sm:p-5", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">Price history</h2>
          <p className="text-xs text-muted">
            {outcomes.find((o) => o.id === selected)?.label}{" "}
            <span className={cn("font-semibold tabular", delta >= 0 ? "text-yes" : "text-no")}>
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} pts
            </span>{" "}
            over {range === "ALL" ? "all time" : range}
          </p>
        </div>
        <Segmented value={range} onChange={setRange} size="sm" ariaLabel="Time range" options={(["1D", "1W", "1M", "ALL"] as Range[]).map((r) => ({ value: r, label: r }))} />
      </div>

      {kind === "multi" && (
        <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Outcomes shown">
          {orderedOutcomes.map((o) => {
            const on = visible.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setVisible((v) => (on ? v.filter((x) => x !== o.id) : [...v, o.id]));
                  onSelect?.(o.id);
                }}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors", on ? "border-transparent text-text" : "border-border text-faint")}
                style={on ? { background: `color-mix(in srgb, ${colorOf(o.id)} 15%, transparent)` } : undefined}
              >
                <span className="size-2 rounded-full" style={{ background: colorOf(o.id), opacity: on ? 1 : 0.4 }} />
                {o.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="h-56 sm:h-64" role="img" aria-label="Probability over time">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "binary" ? (
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="yesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--yes)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--yes)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" tickFormatter={(t) => fmtTime(t, range)} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={48} />
              <YAxis domain={domain} tickFormatter={(v) => `${v}%`} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip range={range} labelFor={(id) => outcomes.find((o) => o.id === id)?.label ?? id} />} cursor={{ stroke: "var(--border-strong)" }} />
              <Area type="monotone" dataKey="yes" name="yes" stroke="var(--yes)" strokeWidth={2} fill="url(#yesFill)" dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" tickFormatter={(t) => fmtTime(t, range)} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={48} />
              <YAxis domain={domain} tickFormatter={(v) => `${v}%`} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip range={range} labelFor={(id) => outcomes.find((o) => o.id === id)?.label ?? id} />} cursor={{ stroke: "var(--border-strong)" }} />
              {visible.map((id) => (
                <Line key={id} type="monotone" dataKey={id} name={id} stroke={colorOf(id)} strokeWidth={id === selected ? 2.5 : 1.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  range,
  labelFor,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: number;
  range: Range;
  labelFor: (id: string) => string;
}) {
  if (!active || !payload?.length || label === undefined) return null;
  return (
    <div className="card px-3 py-2 text-xs shadow-float">
      <p className="mb-1 font-medium text-muted">{new Date(label).toLocaleString("en-US", { month: "short", day: "numeric", ...(range === "1D" ? { hour: "numeric", minute: "2-digit" } : {}) })}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 font-semibold tabular">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {labelFor(p.name ?? "")}: {p.value}%
        </p>
      ))}
    </div>
  );
}
