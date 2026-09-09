import Link from "next/link";
import { ArrowRight, GraduationCap, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sparkline } from "@/components/ui/sparkline";
import { CountUp } from "@/components/ui/count-up";
import { CategoryBadge, ChangeChip } from "@/components/market/bits";
import { LocalizedTitle } from "@/components/market/localized-title";
import { formatCents, formatCompact, formatMoney, formatPct } from "@/lib/format";
import { timeUntilLocalized } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { primaryOutcome } from "@/lib/pricing";
import type { MarketSummary } from "@/lib/types";
import { TryDemoButton } from "./try-demo-button";

export async function Hero({ spotlight, stats }: { spotlight: MarketSummary; stats: { markets: number; volume: number; traders: number } }) {
  const { t } = await getT();
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
            <span className="size-1.5 rounded-full bg-yes animate-pulse-dot" aria-hidden /> {t("home.liveBadge")}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            {t("home.title1")} <span className="text-gradient">{t("home.title2")}</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted sm:text-lg">{t("home.subtitle")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/markets" className={buttonVariants({ size: "lg" })}>
              {t("home.explore")} <ArrowRight className="size-4" />
            </Link>
            <TryDemoButton />
          </div>
          <Link href="/learn" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
            <GraduationCap className="size-4" /> {t("home.learnBasics")}
          </Link>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-muted">{t("home.openMarkets")}</dt>
              <dd className="text-xl font-bold tabular tracking-tight sm:text-2xl"><CountUp value={stats.markets} kind="compact" /></dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t("home.volume")}</dt>
              <dd className="text-xl font-bold tabular tracking-tight sm:text-2xl"><CountUp value={stats.volume} kind="money" /></dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t("home.tradersStat")}</dt>
              <dd className="text-xl font-bold tabular tracking-tight sm:text-2xl"><CountUp value={stats.traders} kind="compact" /></dd>
            </div>
          </dl>
        </div>

        <Link href={`/markets/${spotlight.slug}`} className="card group block p-5 shadow-float transition-transform hover:-translate-y-0.5" aria-label={spotlight.title}>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand">
              <Zap className="size-3.5" /> {t("home.spotlight")}
            </span>
            <CategoryBadge category={spotlight.category} />
          </div>
          <p className="mt-3 line-clamp-2 text-lg font-semibold leading-snug">
            <LocalizedTitle slug={spotlight.slug} title={spotlight.title} badge={false} />
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold tabular tracking-tight">{formatPct(primary.price)}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                {spotlight.kind === "binary" ? t("home.chanceYes") : primary.label} <ChangeChip delta={spotlight.change24h} />
              </p>
            </div>
            <Sparkline data={spotlight.spark} width={140} height={48} strokeWidth={2} />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span className="tabular"><strong className="text-text">{formatMoney(spotlight.volume)}</strong> {t("common.vol")}</span>
            <span className="tabular">{formatCompact(spotlight.traders)} {t("common.traders")}</span>
            <span suppressHydrationWarning>{timeUntilLocalized(t, spotlight.closesAt)}</span>
          </div>
          {yes && no && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <span className="flex h-10 items-center justify-center rounded-xl bg-yes-soft text-sm font-bold text-yes">{t("common.yes")} {formatCents(yes.price)}</span>
              <span className="flex h-10 items-center justify-center rounded-xl bg-no-soft text-sm font-bold text-no">{t("common.no")} {formatCents(no.price)}</span>
            </div>
          )}
        </Link>
      </div>
    </section>
  );
}
