"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatPct } from "@/lib/format";
import { primaryOutcome } from "@/lib/pricing";
import type { MarketSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { api, useSession } from "@/store/session";

const EMPTY: string[] = [];

/** Starred markets with live prices, shown in the desktop sidebar. */
export function SidebarWatchlist() {
  // Stable selector: a fresh `[]` per render would make useSyncExternalStore loop.
  const watchlist = useSession((s) => s.user?.watchlist) ?? EMPTY;
  const key = watchlist.join(",");
  const [fetched, setFetched] = useState<MarketSummary[]>([]);
  // Only show markets that are still starred, so removals are instant without a refetch.
  const items = key ? fetched.filter((m) => watchlist.includes(m.slug)) : [];

  useEffect(() => {
    if (!key) return;
    let alive = true;
    api<MarketSummary[]>("/api/watchlist")
      .then((d) => alive && setFetched(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key]);

  if (watchlist.length === 0) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between px-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Watchlist</p>
        <Link href="/watchlist" className="text-[11px] font-semibold text-brand hover:underline">
          All {watchlist.length}
        </Link>
      </div>
      <ul className="space-y-0.5">
        {items.slice(0, 5).map((m) => {
          const p = primaryOutcome(m);
          return (
            <li key={m.slug}>
              <Link href={`/markets/${m.slug}`} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs hover:bg-surface-2">
                <span aria-hidden>{m.icon}</span>
                <span className="min-w-0 flex-1 truncate text-muted">{m.title}</span>
                <span className={cn("font-bold tabular", m.change24h >= 0 ? "text-yes" : "text-no")}>{formatPct(p.price)}</span>
              </Link>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="flex items-center gap-2 px-3 py-1.5 text-xs text-faint">
            <Star className="size-3.5" /> Loading…
          </li>
        )}
      </ul>
    </div>
  );
}
