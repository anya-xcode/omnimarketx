import Link from "next/link";
import { BadgeCheck, LineChart, Search, Trophy, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Sparkline } from "@/components/ui/sparkline";
import { ChangeChip, MarketIcon } from "@/components/market/bits";
import { CATEGORY_MAP } from "@/lib/categories";
import { formatMoney, formatPct } from "@/lib/format";
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
            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">{m.title}</p>
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

const STEPS = [
  { icon: Search, title: "Pick a question", body: "Browse markets on real events. Every price is the crowd's live probability, from 1¢ to 99¢." },
  { icon: LineChart, title: "Buy Yes or No", body: "Shares pay $1 if you're right. Buy Yes at 62¢ and you earn 38¢ per share when it resolves Yes." },
  { icon: Trophy, title: "Track and climb", body: "Follow your positions, share your reasoning on Pulse, and climb the leaderboard." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24">
      <div className="card grid gap-6 p-6 sm:p-8 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <s.icon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-faint">Step {i + 1}</p>
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

export function TopPredictors({ traders, className }: { traders: Trader[]; className?: string }) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-bold">Top predictors</h3>
        <Link href="/leaderboard" className="text-xs font-semibold text-brand hover:underline">
          Leaderboard →
        </Link>
      </div>
      <ol className="divide-y divide-border">
        {traders.map((t, i) => (
          <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-4 text-center text-xs font-bold text-faint">{i + 1}</span>
            <Avatar name={t.name} color={t.avatarColor} size={30} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-semibold">
                {t.name} {t.verified && <BadgeCheck className="size-3.5 text-accent" aria-label="Verified" />}
              </p>
              <p className="text-xs text-muted">@{t.handle}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular text-yes">+{Math.round(t.roi * 100)}%</p>
              <p className="text-[11px] text-faint tabular">{formatMoney(t.pnl)} P&amp;L</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function GroupsPreview({ groups, className }: { groups: Group[]; className?: string }) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-bold">Groups you might like</h3>
      </div>
      <ul className="divide-y divide-border">
        {groups.map((g) => (
          <li key={g.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-lg">{g.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{g.name}</p>
              <p className="truncate text-xs text-muted">{g.members.toLocaleString()} members · {g.description}</p>
            </div>
            <Link href="/feed" className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-semibold hover:bg-surface-3">
              Join
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand to-accent p-8 text-white sm:p-10">
      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Start with $10,000 in demo funds</h2>
          <p className="mt-1 max-w-md text-sm text-white/85">No sign-up friction. Pick a name, place a trade and watch the price move. Upgrade to real trading when you&apos;re ready.</p>
        </div>
        <Link href="/markets" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-brand shadow-pop hover:bg-white/90">
          <Wallet className="size-4" /> Start trading
        </Link>
      </div>
    </section>
  );
}
