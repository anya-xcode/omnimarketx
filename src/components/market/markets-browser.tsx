"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip, EmptyState } from "@/components/ui/primitives";
import type { MarketQuery, MarketSummary, Paginated, QuickFilter, SortKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLocalStorageValue } from "@/lib/use-local-storage";
import { api } from "@/store/session";
import { CategoryChips } from "./category-chips";
import { MarketCard, MarketCardSkeleton } from "./market-card";
import { MarketRow } from "./market-row";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "volume", label: "Volume" },
  { value: "newest", label: "Newest" },
  { value: "probability", label: "Probability" },
  { value: "closing", label: "Closing soon" },
];

const FILTERS: { value: QuickFilter; label: string }[] = [
  { value: "high-volume", label: "High volume" },
  { value: "rising", label: "Rising" },
  { value: "falling", label: "Falling" },
  { value: "new", label: "New" },
  { value: "closing-soon", label: "Closing soon" },
];

function buildHref(pathname: string, current: URLSearchParams, patch: Record<string, string | undefined>) {
  const sp = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined || v === "" || v === "all") sp.delete(k);
    else sp.set(k, v);
  }
  sp.delete("offset");
  const s = sp.toString();
  return s ? `${pathname}?${s}` : pathname;
}

/**
 * Markets browser. Filters live in the URL (shareable, back-button friendly); the first page is
 * server-rendered and "Load more" appends from the JSON API.
 */
export function MarketsBrowser({ initial, query }: { initial: Paginated<MarketSummary>; query: MarketQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [nextOffset, setNextOffset] = useState(initial.nextOffset);
  const [loadingMore, setLoadingMore] = useState(false);
  const [storedView, setStoredView] = useLocalStorageValue("omx:markets-view", "grid");
  const view: "grid" | "list" = storedView === "list" ? "list" : "grid";
  const [search, setSearch] = useState(query.q ?? "");
  const searchRef = useRef<HTMLInputElement>(null);

  const navigate = useCallback(
    (patch: Record<string, string | undefined>) => {
      startTransition(() => router.replace(buildHref(pathname, searchParams, patch), { scroll: false }));
    },
    [router, pathname, searchParams],
  );

  // Debounced search -> URL
  useEffect(() => {
    if ((query.q ?? "") === search.trim()) return;
    const t = setTimeout(() => navigate({ q: search.trim() || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const loadMore = async () => {
    if (nextOffset === null) return;
    setLoadingMore(true);
    try {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("offset", String(nextOffset));
      sp.set("limit", String(query.limit ?? 12));
      const page = await api<Paginated<MarketSummary>>(`/api/markets?${sp.toString()}`);
      setItems((prev) => [...prev, ...page.items]);
      setNextOffset(page.nextOffset);
      setTotal(page.total);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasFilters = Boolean(query.q || query.filter || (query.category && query.category !== "all"));
  const chipParams = useMemo(() => {
    const out: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      if (k !== "category" && k !== "offset") out[k] = v;
    });
    return out;
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <CategoryChips active={query.category ?? "all"} basePath={pathname} params={chipParams} />

      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter markets by keyword…"
            aria-label="Filter markets"
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-9 text-sm outline-none placeholder:text-faint focus:border-brand"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-faint hover:text-text">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs font-medium text-muted">
            Sort
          </label>
          <select
            id="sort"
            value={query.sort ?? "trending"}
            onChange={(e) => navigate({ sort: e.target.value })}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium outline-none focus:border-brand"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="ml-auto inline-flex rounded-xl bg-surface-2 p-1" role="radiogroup" aria-label="View">
            {(
              [
                ["grid", LayoutGrid, "Grid view"],
                ["list", List, "List view"],
              ] as const
            ).map(([v, Icon, label]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                aria-label={label}
                onClick={() => setStoredView(v)}
                className={cn("rounded-lg p-1.5", view === v ? "bg-surface text-text shadow-card" : "text-muted hover:text-text")}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.value} active={query.filter === f.value} onClick={() => navigate({ filter: query.filter === f.value ? undefined : f.value })}>
            {f.label}
          </Chip>
        ))}
        <p className="ml-auto text-sm text-muted" aria-live="polite">
          {pending ? "Updating…" : `${total} market${total === 1 ? "" : "s"}`}
        </p>
      </div>

      {pending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MarketCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No markets match those filters"
          description="Try a different keyword or category, or clear the filters to see everything that's open."
          action={{ label: "Clear filters", href: pathname }}
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((m) => (
            <MarketCard key={m.slug} market={m} />
          ))}
        </div>
      ) : (
        <div className="card divide-y divide-border overflow-hidden">
          {items.map((m) => (
            <MarketRow key={m.slug} market={m} />
          ))}
        </div>
      )}

      {nextOffset !== null && !pending && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={loadMore} loading={loadingMore}>
            Load more ({total - items.length} remaining)
          </Button>
        </div>
      )}
      {hasFilters && items.length > 0 && !pending && (
        <p className="text-center text-xs text-faint">
          Showing filtered results.{" "}
          <button type="button" className="font-semibold text-brand hover:underline" onClick={() => { setSearch(""); router.replace(pathname); }}>
            Clear all filters
          </button>
        </p>
      )}
    </div>
  );
}
