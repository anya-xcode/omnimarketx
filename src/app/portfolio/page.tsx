import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, History } from "lucide-react";
import { EmptyState, Stat } from "@/components/ui/primitives";
import { CATEGORY_MAP } from "@/lib/categories";
import { formatCents, formatDate, formatMoney, formatSignedMoney, timeAgo } from "@/lib/format";
import { getPositions, getTrades, getUser } from "@/lib/repo";
import { getSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Portfolio", robots: { index: false } };

export default async function PortfolioPage() {
  const id = await getSessionId();
  const [user, positions, trades] = await Promise.all([getUser(id), id ? getPositions(id) : [], id ? getTrades(id, 30) : []]);
  const balance = user?.balance ?? 10_000;
  const invested = positions.reduce((s, p) => s + p.invested, 0);
  const value = positions.reduce((s, p) => s + p.value, 0);
  const pnl = value - invested;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Your account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Portfolio</h1>
        <p className="mt-1 text-sm text-muted">{user ? `Trading as ${user.name}` : "Demo account"} · balances are simulated, no real money.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Available balance" value={formatMoney(balance, { compact: false })} hint="Demo funds" />
        <Stat label="Positions value" value={formatMoney(value, { compact: false })} hint={`${positions.length} open position${positions.length === 1 ? "" : "s"}`} />
        <Stat label="Invested" value={formatMoney(invested, { compact: false })} />
        <Stat label="Unrealised P&L" value={<span className={pnl >= 0 ? "text-yes" : "text-no"}>{formatSignedMoney(pnl)}</span>} hint={invested > 0 ? `${((pnl / invested) * 100).toFixed(1)}% return` : undefined} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Open positions</h2>
        {positions.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No open positions yet"
            description="Buy Yes or No shares on any market and they'll show up here with live value and P&L."
            action={{ label: "Find a market", href: "/markets" }}
          />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Market</th>
                  <th className="px-4 py-2.5 font-semibold">Outcome</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Shares</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Avg → Now</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Value</th>
                  <th className="px-4 py-2.5 text-right font-semibold">P&L</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {positions.map((p) => (
                  <tr key={`${p.marketSlug}-${p.outcomeId}`} className="hover:bg-surface-2">
                    <td className="max-w-[280px] px-4 py-3">
                      <Link href={`/markets/${p.marketSlug}`} className="line-clamp-2 font-semibold hover:text-brand">{p.marketTitle}</Link>
                      <p className="text-xs text-muted">{CATEGORY_MAP[p.category].label} · closes {formatDate(p.closesAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", p.outcomeId === "yes" ? "bg-yes-soft text-yes" : p.outcomeId === "no" ? "bg-no-soft text-no" : "bg-accent-soft text-accent")}>{p.outcomeLabel}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular">{p.shares.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular text-muted">{formatCents(p.avgPrice)} → <span className="font-semibold text-text">{formatCents(p.currentPrice)}</span></td>
                    <td className="px-4 py-3 text-right font-semibold tabular">{formatMoney(p.value, { compact: false })}</td>
                    <td className={cn("px-4 py-3 text-right font-bold tabular", p.pnl >= 0 ? "text-yes" : "text-no")}>{formatSignedMoney(p.pnl)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/markets/${p.marketSlug}?outcome=${p.outcomeId}`} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-3">Trade</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Trade history</h2>
        {trades.length === 0 ? (
          <EmptyState icon={History} title="No trades yet" description="Your buys and sells will be listed here." />
        ) : (
          <ul className="card divide-y divide-border">
            {trades.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className={cn("w-12 rounded-md px-2 py-0.5 text-center text-xs font-bold uppercase", t.side === "buy" ? "bg-yes-soft text-yes" : "bg-no-soft text-no")}>{t.side}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/markets/${t.marketSlug}`} className="line-clamp-1 font-medium hover:text-brand">{t.marketTitle}</Link>
                  <p className="text-xs text-muted">{t.shares.toFixed(2)} {t.outcomeLabel} @ {formatCents(t.price)} · <span suppressHydrationWarning>{timeAgo(t.createdAt)}</span></p>
                </div>
                <span className="font-semibold tabular">{t.side === "buy" ? "-" : "+"}{formatMoney(t.amount, { compact: false })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
