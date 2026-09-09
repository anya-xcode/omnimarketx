import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, Coins, Gavel, LineChart, ShieldAlert } from "lucide-react";
import { PayoutCalculator } from "@/components/learn/payout-calculator";
import { Quiz } from "@/components/learn/quiz";
import { LearnTourLink } from "@/components/learn/tour-link";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Learn", description: "Prediction markets explained in five minutes: prices, shares, payouts, resolution and risk." };

type Lesson = { icon: typeof Coins; title: string; body: string; example?: string };

const LESSONS: Record<"en" | "zh", Lesson[]> = {
  en: [
    { icon: BookOpenCheck, title: "A market is a question with a price", body: "Every market asks a yes/no question about a real event, for example “Will the Fed cut rates in December?”. The price of a Yes share is the crowd's estimate of the probability. It moves as people buy and sell.", example: "Yes at 62¢ = the crowd thinks there is a 62% chance." },
    { icon: Coins, title: "Shares pay $1 if you are right", body: "Buy a Yes share for 62¢. If the event happens, the share pays $1, so you make 38¢ profit per share. If it does not happen, the share is worth nothing. No shares work the same way in reverse, and Yes + No always cost about $1 together.", example: "$100 at 62¢ buys 161 shares → $161 if Yes, $0 if No." },
    { icon: LineChart, title: "You can sell before the market resolves", body: "You do not have to wait for the outcome. If the price moves in your favour you can sell your shares to lock in profit, or sell to cut a loss. Your portfolio shows the live value of everything you hold." },
    { icon: Gavel, title: "Resolution rules decide the outcome", body: "Every market page lists exactly how and when it resolves, and which official source is used. Read the rules before you trade: the wording matters more than the headline." },
    { icon: BarChart3, title: "Multi-outcome markets", body: "Some questions have several answers, such as “Who will win the election?”. Each outcome has its own price and they add up to about 100%. Buying one outcome works exactly like buying Yes." },
    { icon: ShieldAlert, title: "Manage risk like a pro", body: "Start small, spread positions across markets, and never put in more than you can afford to lose. On OmniMarketX you start with $10,000 in demo funds, so practise until the mechanics feel natural." },
  ],
  zh: [
    { icon: BookOpenCheck, title: "市场就是一个带价格的问题", body: "每个市场都会就一个真实事件提出是/否问题，例如“美联储会在 12 月降息吗？”。“是”份额的价格就是大众对概率的估计，随着买卖而变动。", example: "“是”为 62¢ = 大众认为概率为 62%。" },
    { icon: Coins, title: "猜对每份支付 1 美元", body: "以 62¢ 买入一份“是”。若事件发生，每份支付 1 美元，您每份获利 38¢；若未发生，则一文不值。“否”份额反之亦然，“是”+“否”合计约为 1 美元。", example: "以 62¢ 投入 100 美元可买 161 份 → 结果为“是”得 161 美元，为“否”得 0。" },
    { icon: LineChart, title: "结算前也可以卖出", body: "无需等待结果。价格向有利方向变动时可卖出锁定利润，也可卖出止损。投资组合会显示所有持仓的实时市值。" },
    { icon: Gavel, title: "结算规则决定结果", body: "每个市场页面都写明了如何、何时结算，以及采用哪个官方来源。交易前请先阅读规则：措辞比标题更重要。" },
    { icon: BarChart3, title: "多选项市场", body: "有些问题有多个答案，例如“谁会赢得大选？”。每个选项都有自己的价格，合计约为 100%。买入某个选项与买入“是”完全一样。" },
    { icon: ShieldAlert, title: "像专业人士一样管理风险", body: "从小额开始，把仓位分散到多个市场，永远不要投入超过您能承受损失的金额。在 OmniMarketX，您从 10,000 美元模拟资金起步，可以先练习到熟悉为止。" },
  ],
};

export default async function LearnPage() {
  const { t, locale } = await getT();
  const lessons = LESSONS[locale === "zh" ? "zh" : "en"];
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">{t("learn.eyebrow")}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{t("learn.title")}</h1>
        <p className="mt-2 text-muted">{t("learn.sub")}</p>
        <LearnTourLink />
      </div>

      <ol className="grid gap-4 stagger md:grid-cols-2">
        {lessons.map((l, i) => (
          <li key={l.title} className="card flex gap-4 p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <l.icon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{i + 1} / {lessons.length}</p>
              <h2 className="mt-0.5 font-bold">{l.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{l.body}</p>
              {l.example && <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-xs font-medium">{l.example}</p>}
            </div>
          </li>
        ))}
      </ol>

      <PayoutCalculator />
      <Quiz />

      <div className="flex justify-center">
        <Link href="/markets" className={buttonVariants({ size: "lg" })}>
          {t("learn.cta")} <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
