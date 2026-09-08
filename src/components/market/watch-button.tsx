"use client";

import { Star } from "lucide-react";
import { useSession } from "@/store/session";
import { toast } from "@/store/toast";
import { cn } from "@/lib/utils";

export function WatchButton({ slug, className, size = "sm" }: { slug: string; className?: string; size?: "sm" | "md" }) {
  const watched = useSession((s) => s.user?.watchlist.includes(slug) ?? false);
  const toggle = useSession((s) => s.toggleWatch);
  const user = useSession((s) => s.user);
  return (
    <button
      type="button"
      aria-pressed={watched}
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          toast({ title: "Still connecting…", description: "Try again in a second." });
          return;
        }
        void toggle(slug);
        toast({ title: watched ? "Removed from watchlist" : "Added to watchlist", variant: "success" });
      }}
      className={cn(
        "flex items-center justify-center rounded-lg transition-colors",
        size === "sm" ? "size-8" : "size-10",
        watched ? "text-warn" : "text-faint hover:bg-surface-2 hover:text-text",
        className,
      )}
    >
      <Star className={cn(size === "sm" ? "size-4" : "size-5", watched && "fill-current")} />
    </button>
  );
}
