import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_MAP } from "@/lib/categories";
import { formatSignedPts } from "@/lib/format";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryBadge({ category, className }: { category: CategoryId; className?: string }) {
  const c = CATEGORY_MAP[category];
  return (
    <Badge variant="neutral" className={cn("gap-1", className)} style={{ color: c.color, background: `color-mix(in srgb, ${c.color} 12%, transparent)` }}>
      <span aria-hidden>{c.emoji}</span> {c.label}
    </Badge>
  );
}

export function ChangeChip({ delta, className, size = "sm" }: { delta: number; className?: string; size?: "sm" | "md" }) {
  const up = delta > 0.0005;
  const down = delta < -0.0005;
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 whitespace-nowrap rounded-md font-semibold tabular",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs",
        up ? "bg-yes-soft text-yes" : down ? "bg-no-soft text-no" : "bg-surface-2 text-muted",
        className,
      )}
      title="24h change in probability"
    >
      <Icon className="size-3" aria-hidden />
      {formatSignedPts(delta)}
    </span>
  );
}

export function regionFlag(code?: string) {
  if (!code || code.length !== 2) return null;
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function MarketIcon({ icon, category, size = "md", className }: { icon: string; category: CategoryId; size?: "sm" | "md" | "lg"; className?: string }) {
  const c = CATEGORY_MAP[category];
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        size === "sm" ? "size-8 text-base" : size === "md" ? "size-10 text-lg" : "size-14 text-3xl rounded-2xl",
        className,
      )}
      style={{ background: `color-mix(in srgb, ${c.color} 14%, var(--surface-2))` }}
    >
      {icon}
    </span>
  );
}

export const OUTCOME_COLORS = ["#f0286b", "#6d4aff", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#64748b"];

export function outcomeColor(index: number, id?: string) {
  if (id === "yes") return "var(--yes)";
  if (id === "no") return "var(--no)";
  return OUTCOME_COLORS[index % OUTCOME_COLORS.length];
}
