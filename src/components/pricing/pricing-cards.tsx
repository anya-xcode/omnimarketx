"use client";

import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/primitives";
import { useSession } from "@/store/session";
import { toast } from "@/store/toast";
import { cn } from "@/lib/utils";

const FREE = ["Browse & trade markets", "Create markets", "Join groups", "Pulse social feed", "Leaderboards", "Basic portfolio", "Referral link (no payouts)"];
const PRO = ["Everything in Free", "Referral commissions, 2-10%", "Pro badge (verified checkmark)", "Advanced analytics (soon)", "AI market insights (soon)", "Whale alerts (soon)", "API access (soon)"];

export function PricingCards() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const openAuth = useSession((s) => s.openAuth);
  const price = billing === "monthly" ? 14.99 : 12.49;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Segmented
          value={billing}
          onChange={setBilling}
          ariaLabel="Billing period"
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: (<span>Yearly <span className="ml-1 rounded-md bg-yes-soft px-1.5 py-0.5 text-[10px] font-bold text-yes">SAVE 17%</span></span>) },
          ]}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card flex flex-col p-6">
          <h2 className="text-lg font-bold">Free</h2>
          <p className="text-sm text-muted">Everything you need to start trading.</p>
          <p className="mt-5 text-4xl font-bold tabular tracking-tight">$0<span className="text-base font-medium text-muted">/month</span></p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm">
            {FREE.map((f) => (
              <li key={f} className="flex items-center gap-2.5"><Check className="size-4 shrink-0 text-yes" /> {f}</li>
            ))}
          </ul>
          <Button variant="outline" className="mt-6 w-full" disabled>
            Current plan
          </Button>
        </div>

        <div className={cn("relative flex flex-col overflow-hidden rounded-[18px] border border-brand/40 bg-surface shadow-pop")}>
          <div className="bg-gradient-to-r from-brand to-accent px-6 py-5 text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"><Crown className="size-3" /> Most popular</span>
            <h2 className="mt-2 text-xl font-bold">OmniMarketX Pro</h2>
            <p className="text-sm text-white/85">Advanced tools and creator features.</p>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="text-4xl font-bold tabular tracking-tight">
              ${price.toFixed(2)}<span className="text-base font-medium text-muted">/month</span>
            </p>
            <p className="text-xs text-muted">{billing === "monthly" ? "Billed monthly" : "Billed $149.88 yearly"}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {PRO.map((f) => (
                <li key={f} className="flex items-center gap-2.5"><Check className="size-4 shrink-0 text-brand" /> {f}</li>
              ))}
            </ul>
            <Button size="lg" className="mt-6 w-full" onClick={() => { openAuth(); toast({ title: "Pro checkout is not wired in this demo", description: "Sign in to explore the rest of the product." }); }}>
              Upgrade to Pro
            </Button>
            <p className="mt-2 text-center text-[11px] text-faint">Secure payment · Visa, Mastercard, Apple Pay, Google Pay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
