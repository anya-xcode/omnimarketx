"use client";

import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "@/store/session";
import { toast } from "@/store/toast";
import { cn } from "@/lib/utils";

export function WatchButton({ slug, className, size = "sm" }: { slug: string; className?: string; size?: "sm" | "md" }) {
  const watched = useSession((s) => s.user?.watchlist.includes(slug) ?? false);
  const toggle = useSession((s) => s.toggleWatch);
  const user = useSession((s) => s.user);
  const { t } = useI18n();
  const label = watched ? t("common.removeWatch") : t("common.addWatch");
  return (
    <button
      type="button"
      aria-pressed={watched}
      aria-label={label}
      title={label}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          await useSession.getState().load();
          if (!useSession.getState().user) {
            toast({ title: "Couldn't reach the server", description: "Please try again.", variant: "error" });
            return;
          }
        }
        void toggle(slug);
        toast({ title: watched ? t("common.removedWatch") : t("common.addedWatch"), variant: "success" });
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
