import { cn } from "@/lib/utils";

export function Avatar({ name, color, size = 36, className }: { name: string; color?: string; size?: number; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: color ?? "var(--accent)" }}
    >
      {initials || "?"}
    </span>
  );
}
