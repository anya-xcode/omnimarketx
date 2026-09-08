"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";
import { ArrowRight, CornerDownLeft, Search, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_MAP } from "@/lib/categories";
import { formatPct } from "@/lib/format";
import { primaryOutcome } from "@/lib/pricing";
import type { MarketSummary, Trader } from "@/lib/types";
import { cn } from "@/lib/utils";
import { api } from "@/store/session";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-config";

interface PaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
export const useCommandPalette = create<PaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

type Item = { key: string; group: "Markets" | "Traders" | "Pages"; label: string; sub?: string; href: string; render?: React.ReactNode };

/** Global hotkeys + mount/unmount of the dialog. The dialog itself owns its state so it resets on every open. */
export function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPalette();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        useCommandPalette.getState().open();
      } else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, close]);

  if (!isOpen) return null;
  return <PaletteDialog close={close} />;
}

function PaletteDialog({ close }: { close: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [markets, setMarkets] = useState<MarketSummary[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const term = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (term.length < 2) {
        setMarkets([]);
        setTraders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await api<{ markets: MarketSummary[]; traders: Trader[] }>(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        setMarkets(data.markets);
        setTraders(data.traders);
        setActive(0);
      } catch {
        /* aborted or failed; keep previous results */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const items = useMemo<Item[]>(() => {
    const term = q.trim().toLowerCase();
    const pages = [...PRIMARY_NAV, ...SECONDARY_NAV]
      .filter((p) => !term || p.label.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term))
      .map<Item>((p) => ({ key: `p:${p.href}`, group: "Pages", label: p.label, sub: p.description, href: p.href }));
    const ms = markets.map<Item>((m) => ({
      key: `m:${m.slug}`,
      group: "Markets",
      label: m.title,
      sub: `${CATEGORY_MAP[m.category].label} · ${formatPct(primaryOutcome(m).price)} ${m.kind === "binary" ? "Yes" : primaryOutcome(m).label}`,
      href: `/markets/${m.slug}`,
    }));
    const ts = traders.map<Item>((t) => ({ key: `t:${t.id}`, group: "Traders", label: t.name, sub: `@${t.handle} · ROI +${Math.round(t.roi * 100)}%`, href: "/leaderboard" }));
    const searchAll: Item[] = term.length >= 2 ? [{ key: "search", group: "Markets", label: `Search all markets for “${q.trim()}”`, href: `/markets?q=${encodeURIComponent(q.trim())}` }] : [];
    return [...ms, ...searchAll, ...ts, ...(term ? pages : pages.slice(0, 6))];
  }, [q, markets, traders]);

  const go = useCallback(
    (item: Item) => {
      close();
      router.push(item.href);
    },
    [close, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      go(items[active]);
    }
  };

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center bg-black/50 p-4 pt-[8vh] backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div role="dialog" aria-modal="true" aria-label="Search" className="card w-full max-w-xl overflow-hidden shadow-pop">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search markets, traders, pages…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={items[active]?.key}
            className="h-13 flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-faint"
          />
          {loading && <span className="size-4 animate-spin rounded-full border-2 border-border border-t-brand" aria-label="Searching" />}
          <kbd className="hidden rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">Esc</kbd>
        </div>
        <ul id="palette-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-muted">{q.trim().length >= 2 && !loading ? "No results. Try a different keyword." : "Type to search markets…"}</li>
          )}
          {items.map((item, i) => {
            const showHeader = item.group !== lastGroup;
            lastGroup = item.group;
            const market = item.key.startsWith("m:") ? markets.find((m) => `m:${m.slug}` === item.key) : undefined;
            const trader = item.key.startsWith("t:") ? traders.find((t) => `t:${t.id}` === item.key) : undefined;
            return (
              <li key={item.key} role="presentation">
                {showHeader && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-faint">{item.group}</p>}
                <button
                  id={item.key}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", i === active ? "bg-surface-2" : "hover:bg-surface-2")}
                >
                  {market ? (
                    <span className="flex size-8 items-center justify-center rounded-lg bg-surface-3 text-base">{market.icon}</span>
                  ) : trader ? (
                    <Avatar name={trader.name} color={trader.avatarColor} size={32} />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-lg bg-surface-3 text-muted">
                      {item.key === "search" ? <Search className="size-4" /> : <ArrowRight className="size-4" />}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    {item.sub && <span className="block truncate text-xs text-muted">{item.sub}</span>}
                  </span>
                  {market && (
                    <Badge variant={market.change24h >= 0 ? "yes" : "no"} className="normal-case">
                      <TrendingUp className="size-3" /> {formatPct(primaryOutcome(market).price)}
                    </Badge>
                  )}
                  {i === active && <CornerDownLeft className="size-3.5 text-faint" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
