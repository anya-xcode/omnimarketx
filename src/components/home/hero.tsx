import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sparkline } from "@/components/ui/sparkline";
import { CategoryBadge, ChangeChip } from "@/components/market/bits";
import { formatCents, formatCompact, formatMoney, formatPct, timeUntil } from "@/lib/format";
import { primaryOutcome } from "@/lib/pricing";
import type { MarketSummary } from "@/lib/types";
import { TryDemoButton } from "./try-demo-button";

export function Hero({ spotlight, stats }: { spotlight: MarketSummary; stats: { markets: number; volume: number; traders: number } }) {
  const primary = primaryOutcome(spotlight);
  const yes = spotlight.outcomes.find((o) => o.id === "yes");
  const no = spotlight.outcomes.find((o) => o.id === "no");
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-accent/15 blur-3xl" aria-hidden />
      <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-muted">
            <span className="size-1.5 rounded-full bg-yes animate-pulse-dot" aria-hidden /> Live markets · demo trading open to everyone
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            Trade what <span className="text-gradient">matters.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted sm:text-lg">
            The social prediction market. Buy and sell shares in real-world outcomes across crypto, politics, sports, the economy and more, and see what
            the crowd really thinks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/markets" className={buttonVariants({ size: "lg" })}>
              Explore markets <ArrowRight className="size-4" />
            </Link>
            <TryDemoButton />
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {[
              ["Open markets", formatCompact(stats.markets)],
              ["Volume traded", formatMoney(stats.volume)],
              ["Traders", formatCompact(stats.traders)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="text-xl font-bold tabular tracking-tight sm:text-2xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Link href={`/markets/${spotlight.slug}`} className="card group block p-5 shadow-float transition-transform hover:-translate-y-0.5" aria-label={`Spotlight: ${spotlight.title}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand">
              <Zap className="size-3.5" /> Spotlight
            </span>
            <CategoryBadge category={spotlight.category} />
          </div>
          <p className="mt-3 line-clamp-2 text-lg font-semibold leading-snug">{spotlight.title}</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold tabular tracking-tight">{formatPct(primary.price)}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                {spotlight.kind === "binary" ? "chance of Yes" : primary.label} <ChangeChip delta={spotlight.change24h} />
              </p>
            </div>
            <Sparkline data={spotlight.spark} width={140} height={48} strokeWidth={2} />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span className="tabular"><strong className="text-text">{formatMoney(spotlight.volume)}</strong> volume</span>
            <span className="tabular">{formatCompact(spotlight.traders)} traders</span>
            <span suppressHydrationWarning>{timeUntil(spotlight.closesAt)}</span>
          </div>
          {yes && no && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <span className="flex h-10 items-center justify-center rounded-xl bg-yes-soft text-sm font-bold text-yes">Yes {formatCents(yes.price)}</span>
              <span className="flex h-10 items-center justify-center rounded-xl bg-no-soft text-sm font-bold text-no">No {formatCents(no.price)}</span>
            </div>
          )}
        </Link>
      </div>
    </section>
  );
}
