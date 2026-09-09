import Link from "next/link";
import { Globe2, Lock, Sparkles, Users } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const COLUMNS = [
  {
    title: "Markets",
    links: [
      { label: "Trending", href: "/trending" },
      { label: "New markets", href: "/markets?sort=newest" },
      ...CATEGORIES.map((c) => ({ label: c.label, href: `/markets?category=${c.id}` })),
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Learn", href: "/learn" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "OmniMarketX Pro", href: "/subscription" },
      { label: "Invite & Earn", href: "/subscription#invite" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/blog" },
      { label: "Careers", href: "/blog" },
      { label: "Contact", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Risk disclosure", href: "/legal/risk" },
      { label: "Market integrity", href: "/legal/integrity" },
    ],
  },
];

const TRUST = [
  { icon: Lock, title: "Secure & transparent", body: "Markets are auditable and rules are published before trading opens." },
  { icon: Globe2, title: "Global access", body: "Trade 24/7 across sports, crypto, politics, economy and more." },
  { icon: Users, title: "Built for everyone", body: "Simple enough for a first trade, deep enough for pros." },
  { icon: Sparkles, title: "Rewards & incentives", body: "Leaderboards, streaks and creator incentives." },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <div className="card mb-12 flex flex-col gap-5 bg-gradient-to-br from-brand-soft to-accent-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Stay ahead of the market</h2>
            <p className="mt-1 text-sm text-muted">Weekly market insights and platform updates. No spam, unsubscribe any time.</p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">The world&apos;s leading social prediction market. Trade what matters.</p>
            <div className="mt-4 flex gap-2">
              {[
                ["X", "https://x.com/OmnimarketX"],
                ["Instagram", "https://www.instagram.com/omnimarketx/"],
                ["Discord", "https://discord.gg/hPZgqrmYJA"],
                ["YouTube", "https://www.youtube.com/@OmniMarketX"],
                ["LinkedIn", "https://www.linkedin.com/company/omnimarket-x/"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:border-border-strong hover:text-text"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted transition-colors hover:text-text">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-brand">
                <t.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="mt-0.5 text-xs text-muted">{t.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} OmniMarketX. All rights reserved. Demo trading only, no real money is used.</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="hover:text-text">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-text">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-text">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
