import Link from "next/link";
import { BadgeCheck, LineChart, Search, Trophy, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Sparkline } from "@/components/ui/sparkline";
import { ChangeChip, MarketIcon } from "@/components/market/bits";
import { LocalizedTitle } from "@/components/market/localized-title";
import { CATEGORY_MAP } from "@/lib/categories";
import { formatMoney, formatPct } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { primaryOutcome } from "@/lib/pricing";
import type { FeedPost, Group, MarketSummary, Trader } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PostCard } from "@/components/feed/post-card";

export function MoversRail({ markets }: { markets: MarketSummary[] }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x sm:mx-0 sm:px-0">
      {markets.map((m) => {
        const primary = primaryOutcome(m);
        return (
          <Link
            key={m.slug}
            href={`/markets/${m.slug}`}
            className="card flex w-[260px] shrink-0 snap-start flex-col gap-3 p-4 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-float"
          >
            <div className="flex items-center gap-2.5">
              <MarketIcon icon={m.icon} category={m.category} size="sm" />
              <span className="text-xs font-semibold" style={{ color: CATEGORY_MAP[m.category].color }}>
                {CATEGORY_MAP[m.category].label}
              </span>
            </div>
            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">
              <LocalizedTitle slug={m.slug} title={m.title} badge={false} />
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tabular leading-none">{formatPct(primary.price)}</p>
                <ChangeChip delta={m.change24h} className="mt-1.5" />
              </div>
              <Sparkline data={m.spark} width={80} height={30} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export async function HowItWorks() {
  const { t } = await getT();
  const steps = [
    { icon: Search, title: t("home.how.1.title"), body: t("home.how.1.body") },
    { icon: LineChart, title: t("home.how.2.title"), body: t("home.how.2.body") },
    { icon: Trophy, title: t("home.how.3.title"), body: t("home.how.3.body") },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-24">
      <div className="card grid gap-6 p-6 sm:p-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <s.icon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-faint">{t("home.how.step", { n: i + 1 })}</p>
              <h3 className="mt-0.5 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PulsePreview({ posts, markets }: { posts: FeedPost[]; markets: Map<string, MarketSummary> }) {
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} market={p.marketSlug ? markets.get(p.marketSlug) : undefined} />
      ))}
    </div>
  );
}

export async function TopPredictors({ traders, className }: { traders: Trader[]; className?: string }) {
  const { t } = await getT();
  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-bold">{t("home.topPredictors")}</h3>
        <Link href="/leaderboard" className="text-xs font-semibold text-brand hover:underline">
          {t("nav.leaderboard")} →
        </Link>
      </div>
      <ol className="divide-y divide-border">
        {traders.map((tr, i) => (
          <li key={tr.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-4 text-center text-xs font-bold text-faint">{i + 1}</span>
            <Avatar name={tr.name} color={tr.avatarColor} size={30} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-semibold">
                {tr.name} {tr.verified && <BadgeCheck className="size-3.5 text-accent" aria-label="Verified" />}
              </p>
              <p className="text-xs text-muted">@{tr.handle}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular text-yes">+{Math.round(tr.roi * 100)}%</p>
              <p className="text-[11px] text-faint tabular">{formatMoney(tr.pnl)} P&amp;L</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export async function GroupsPreview({ groups, className }: { groups: Group[]; className?: string }) {
  const { t } = await getT();
  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-bold">{t("home.groups")}</h3>
      </div>
      <ul className="divide-y divide-border">
        {groups.map((g) => (
          <li key={g.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-lg">{g.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{g.name}</p>
              <p className="truncate text-xs text-muted">{g.members.toLocaleString()} · {g.description}</p>
            </div>
            <Link href="/feed" className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-3">
              {t("home.join")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function CtaBand() {
  const { t } = await getT();
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-accent p-8 text-white sm:p-10">
      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("home.cta.title")}</h2>
          <p className="mt-1 max-w-md text-sm text-white/85">{t("home.cta.body")}</p>
        </div>
        <Link href="/markets" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-brand shadow-pop hover:bg-white/90">
          <Wallet className="size-4" /> {t("home.cta.button")}
        </Link>
      </div>
    </section>
  );
}
