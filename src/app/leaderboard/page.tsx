import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Flame, Trophy } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ChipLink } from "@/components/ui/primitives";
import { CATEGORIES, isCategoryId } from "@/lib/categories";
import { formatCompact, formatMoney, formatPct } from "@/lib/format";
import { getTraders } from "@/lib/repo";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Leaderboard", description: "Top predictors on OmniMarketX ranked by ROI, profit, volume and win rate." };
export const revalidate = 60;

const PERIODS = [
  { id: "daily", label: "Today", factor: 0.08 },
  { id: "weekly", label: "This week", factor: 0.3 },
  { id: "monthly", label: "This month", factor: 1 },
  { id: "all", label: "All time", factor: 2.4 },
] as const;
const SORTS = [
  { id: "roi", label: "ROI" },
  { id: "pnl", label: "Profit" },
  { id: "volume", label: "Volume" },
  { id: "winRate", label: "Win rate" },
] as const;

export default async function LeaderboardPage(props: PageProps<"/leaderboard">) {
  const sp = await props.searchParams;
  const { t } = await getT();
  const category = isCategoryId(sp.category) ? sp.category : "all";
  const period = PERIODS.find((p) => p.id === sp.period) ?? PERIODS[2];
  const sort = SORTS.find((s) => s.id === sp.sort) ?? SORTS[0];
  const traders = (await getTraders(category, sort.id)).map((t) => ({ ...t, pnl: t.pnl * period.factor, volume: t.volume * period.factor, trades: Math.round(t.trades * period.factor) }));
  const href = (patch: Record<string, string>) => {
    const q = new URLSearchParams({ period: period.id, sort: sort.id, ...(category !== "all" ? { category } : {}), ...patch });
    if (q.get("category") === "all") q.delete("category");
    return `/leaderboard?${q.toString()}`;
  };
  const podium = traders.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Compete</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Trophy className="size-7 text-warn" /> {t("leaderboard.title")}
          </h1>
          <p className="mt-1 text-sm text-muted">Rankings refresh as trades settle. Demo balances count.</p>
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-warn-soft text-xl">🏆</span>
          <div>
            <p className="text-xs text-muted">Monthly reward pool</p>
            <p className="text-lg font-bold tabular">$250,000</p>
          </div>
        </div>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {PERIODS.map((p) => (
          <ChipLink key={p.id} href={href({ period: p.id })} active={p.id === period.id}>
            {p.label}
          </ChipLink>
        ))}
        <span className="mx-1 hidden w-px bg-border sm:block" />
        <ChipLink href={href({ category: "all" })} active={category === "all"}>All</ChipLink>
        {CATEGORIES.map((c) => (
          <ChipLink key={c.id} href={href({ category: c.id })} active={category === c.id}>
            <span aria-hidden>{c.emoji}</span> {c.label}
          </ChipLink>
        ))}
      </div>

      {podium.length === 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[podium[1], podium[0], podium[2]].map((t) => {
            const rank = podium.indexOf(t) + 1;
            return (
              <div key={t.id} className={cn("card relative flex flex-col items-center p-3 text-center sm:p-5", rank === 1 && "border-warn/60 sm:-translate-y-2")}>
                <span className={cn("absolute left-2 top-2 text-base sm:left-4 sm:top-4 sm:text-lg", rank === 1 ? "" : "opacity-80")} aria-label={`Rank ${rank}`}>
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                </span>
                <Avatar name={t.name} color={t.avatarColor} size={rank === 1 ? 52 : 44} />
                <p className="mt-2 flex items-center justify-center gap-1 text-xs font-bold sm:mt-3 sm:text-base">
                  {t.name} {t.verified && <BadgeCheck className="size-4 text-accent" aria-label="Verified" />}
                </p>
                <p className="hidden text-xs text-muted sm:block">@{t.handle}</p>
                <p className="mt-1 text-lg font-bold tabular text-yes sm:mt-3 sm:text-2xl">+{Math.round(t.roi * 100)}%</p>
                <p className="text-[11px] text-muted sm:text-xs">ROI · {formatMoney(t.pnl)}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold">{traders.length} ranked traders</h2>
          <div className="flex items-center gap-1 text-xs">
            <span className="mr-1 text-muted">Sort by</span>
            {SORTS.map((s) => (
              <Link key={s.id} href={href({ sort: s.id })} className={cn("rounded-md px-2 py-1 font-semibold", s.id === sort.id ? "bg-brand-soft text-brand" : "text-muted hover:text-text")}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">#</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Trader</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">ROI</th>
                <th scope="col" className="hidden px-4 py-2.5 text-right font-semibold sm:table-cell">Profit</th>
                <th scope="col" className="hidden px-4 py-2.5 text-right font-semibold md:table-cell">Volume</th>
                <th scope="col" className="hidden px-4 py-2.5 text-right font-semibold sm:table-cell">Win rate</th>
                <th scope="col" className="hidden px-4 py-2.5 text-right font-semibold sm:table-cell">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {traders.map((t, i) => (
                <tr key={t.id} className="hover:bg-surface-2">
                  <td className="px-3 py-3 font-bold tabular text-faint sm:px-4">{i + 1}</td>
                  <td className="px-2 py-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} color={t.avatarColor} size={32} />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 truncate font-semibold">
                          {t.name} {t.verified && <BadgeCheck className="size-3.5 text-accent" aria-label="Verified" />}
                        </p>
                        <p className="truncate text-xs text-muted">@{t.handle} · {formatCompact(t.trades)} trades</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular text-yes">+{formatPct(t.roi)}<span className="block text-[11px] font-medium text-muted sm:hidden">{formatMoney(t.pnl)}</span></td>
                  <td className="hidden px-4 py-3 text-right font-semibold tabular sm:table-cell">{formatMoney(t.pnl)}</td>
                  <td className="hidden px-4 py-3 text-right tabular text-muted md:table-cell">{formatMoney(t.volume)}</td>
                  <td className="hidden px-4 py-3 text-right tabular sm:table-cell">{formatPct(t.winRate)}</td>
                  <td className="hidden px-4 py-3 text-right tabular sm:table-cell">
                    {t.streak > 0 ? (
                      <span className="inline-flex items-center gap-1 text-warn"><Flame className="size-3.5" /> {t.streak}</span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5 text-sm text-muted">
        <h2 className="mb-1 font-bold text-text">How rankings work</h2>
        <p>ROI is realised profit divided by capital deployed over the selected period. Ties are broken by volume. Trades on markets that resolve N/A are excluded.</p>
      </div>
    </div>
  );
}
