"use client";

import { Share2 } from "lucide-react";
import { toast } from "@/store/toast";

export function ShareButton({ title }: { title: string }) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Share it anywhere.", variant: "success" });
    } catch {
      /* user cancelled */
    }
  };
  return (
    <button type="button" onClick={share} aria-label="Share market" className="flex size-10 items-center justify-center rounded-lg text-faint hover:bg-surface-2 hover:text-text">
      <Share2 className="size-5" />
    </button>
  );
}
