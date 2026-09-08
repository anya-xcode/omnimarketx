import type { Metadata } from "next";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "OmniMarketX Pro", description: "Compare the Free and Pro plans. Advanced analytics, whale alerts, referral commissions and a verified badge." };

const ROWS: { label: string; free: boolean | "soon"; pro: boolean | "soon" }[] = [
  { label: "Browse & trade markets", free: true, pro: true },
  { label: "Create markets", free: true, pro: true },
  { label: "Pulse social feed & groups", free: true, pro: true },
  { label: "Leaderboards & basic portfolio", free: true, pro: true },
  { label: "Referral link", free: true, pro: true },
  { label: "Referral commission payouts (2-10%)", free: false, pro: true },
  { label: "Pro badge (verified checkmark)", free: false, pro: true },
  { label: "Advanced analytics", free: false, pro: "soon" },
  { label: "AI market insights", free: false, pro: "soon" },
  { label: "Whale alerts", free: false, pro: "soon" },
  { label: "Creator dashboard", free: false, pro: "soon" },
  { label: "API access", free: false, pro: "soon" },
];

const TIERS = [
  ["Bronze", "2%", "0-$5k referred volume"],
  ["Silver", "4%", "$5k-$25k"],
  ["Gold", "6%", "$25k-$100k"],
  ["Platinum", "8%", "$100k-$500k"],
  ["Diamond", "10%", "$500k+"],
];

function Cell({ v }: { v: boolean | "soon" }) {
  if (v === "soon") return <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-bold uppercase text-accent">Soon</span>;
  return v ? <Check className="mx-auto size-4 text-yes" aria-label="Included" /> : <Minus className="mx-auto size-4 text-faint" aria-label="Not included" />;
}

export default function SubscriptionPage() {
  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Plans</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Choose your <span className="text-gradient">plan</span></h1>
        <p className="mt-2 text-muted">Free covers everything you need to trade. Pro adds the tools serious predictors ask for, plus referral payouts.</p>
      </div>

      <PricingCards />

      <section id="invite" className="scroll-mt-24 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-bold">Invite &amp; Earn</h2>
          <p className="mt-1 text-sm text-muted">Pro members earn recurring commission on the trading activity of people they invite. Tier is based on 30-day referred volume.</p>
          <ul className="mt-4 divide-y divide-border">
            {TIERS.map(([name, pct, band], i) => (
              <li key={name} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-6 text-center">{["🥉", "🥈", "🥇", "💠", "💎"][i]}</span>
                <span className="flex-1 font-medium">{name}</span>
                <span className="text-xs text-muted">{band}</span>
                <span className="w-12 text-right font-bold tabular text-brand">{pct}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card flex flex-col justify-center gap-4 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-yes" />
            <div>
              <h2 className="font-bold">14-day money-back guarantee</h2>
              <p className="mt-1 text-sm text-muted">Not satisfied? Request a full refund within 14 days of purchase, no questions asked.</p>
            </div>
          </div>
          <div className="rounded-xl bg-surface-2 p-4 text-sm text-muted">
            <p className="font-semibold text-text">Frequently asked</p>
            <p className="mt-2"><strong className="text-text">Can I cancel any time?</strong> Yes. You keep Pro until the end of the billing period.</p>
            <p className="mt-2"><strong className="text-text">Do referral payouts require Pro?</strong> Free accounts can share a link and track sign-ups, but commission payouts are a Pro feature.</p>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">Compare plans</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wider text-faint">
            <tr>
              <th scope="col" className="px-5 py-2.5 text-left font-semibold">Feature</th>
              <th scope="col" className="w-28 px-3 py-2.5 text-center font-semibold">Free</th>
              <th scope="col" className="w-28 px-3 py-2.5 text-center font-semibold text-brand">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ROWS.map((r, i) => (
              <tr key={r.label} className={cn(i % 2 && "bg-surface-2/40")}>
                <td className="px-5 py-3 font-medium">{r.label}</td>
                <td className="px-3 py-3 text-center"><Cell v={r.free} /></td>
                <td className="px-3 py-3 text-center"><Cell v={r.pro} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
