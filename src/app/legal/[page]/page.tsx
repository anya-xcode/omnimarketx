import type { Metadata } from "next";
import { notFound } from "next/navigation";

const PAGES: Record<string, { title: string; body: string[] }> = {
  terms: { title: "Terms of service", body: ["By using OmniMarketX you agree to trade responsibly and to follow the market rules published on every market page.", "This demo environment uses simulated balances. No real money is deposited, traded or withdrawn."] },
  privacy: { title: "Privacy policy", body: ["We store an anonymous session identifier in a cookie so your demo balance and watchlist persist between visits.", "Newsletter emails are stored only to send the updates you asked for and can be removed on request."] },
  risk: { title: "Risk disclosure", body: ["Prediction markets involve risk. Prices can move quickly and positions can lose their full value.", "Never trade with funds you cannot afford to lose. Past performance on the leaderboard is not a guarantee of future results."] },
  integrity: { title: "Market integrity", body: ["Every market publishes its resolution criteria and sources before trading opens.", "Markets with ambiguous outcomes may be resolved N/A and all positions refunded."] },
};

export async function generateMetadata(props: PageProps<"/legal/[page]">): Promise<Metadata> {
  const { page } = await props.params;
  return { title: PAGES[page]?.title ?? "Legal" };
}

export default async function LegalPage(props: PageProps<"/legal/[page]">) {
  const { page } = await props.params;
  const doc = PAGES[page];
  if (!doc) notFound();
  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
      <p className="text-xs text-faint">Last updated September 2026</p>
      <div className="card space-y-3 p-6 text-[15px] leading-relaxed text-muted">
        {doc.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </article>
  );
}
