import { cn } from "@/lib/utils";

const variants = {
  neutral: "bg-surface-2 text-muted",
  brand: "bg-brand-soft text-brand",
  accent: "bg-accent-soft text-accent",
  yes: "bg-yes-soft text-yes",
  no: "bg-no-soft text-no",
  warn: "bg-warn-soft text-warn",
  outline: "border border-border text-muted",
} as const;

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide leading-4", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
