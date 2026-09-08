"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle({ variant = "segmented", className }: { variant?: "segmented" | "icon"; className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // Theme is unknown until hydration; render the neutral state on the server and first paint.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (variant === "icon") {
    const Icon = mounted && resolvedTheme === "dark" ? Sun : Moon;
    return (
      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
        className={cn("flex size-9 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-text", className)}
      >
        <Icon className="size-[18px]" />
      </button>
    );
  }

  return (
    <div className={cn("inline-flex w-full rounded-xl bg-surface-2 p-1", className)} role="radiogroup" aria-label="Theme">
      {OPTIONS.map((o) => {
        const active = mounted && theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(o.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors",
              active ? "bg-surface text-text shadow-card" : "text-muted hover:text-text",
            )}
          >
            <o.icon className="size-3.5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
