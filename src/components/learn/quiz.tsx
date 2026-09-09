"use client";

import { useState } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toast";

type Q = { q: string; options: string[]; answer: number };
const QUESTIONS: Record<"en" | "zh", Q[]> = {
  en: [
    { q: "A market shows Yes at 62¢. What does that mean?", options: ["The market thinks there is a 62% chance of Yes", "You will earn 62¢ per share if Yes wins", "62 people have traded"], answer: 0 },
    { q: "You buy 10 Yes shares at 40¢ and the market resolves Yes. What do you receive?", options: ["$4", "$10", "$6"], answer: 1 },
    { q: "What happens to your No shares if the market resolves Yes?", options: ["They pay $1 each", "They pay nothing", "They are refunded"], answer: 1 },
    { q: "Yes and No prices in one market add up to about…", options: ["$1", "$2", "Whatever traders decide"], answer: 0 },
    { q: "When is a market settled?", options: ["Whenever the price hits 99¢", "When the published resolution source confirms the outcome", "After 30 days"], answer: 1 },
  ],
  zh: [
    { q: "某市场显示“是”为 62¢，这意味着什么？", options: ["市场认为“是”的概率为 62%", "若“是”获胜，每份可赚 62¢", "有 62 个人交易过"], answer: 0 },
    { q: "您以 40¢ 买入 10 份“是”，市场结算为“是”，您会收到多少？", options: ["4 美元", "10 美元", "6 美元"], answer: 1 },
    { q: "若市场结算为“是”，您持有的“否”份额会怎样？", options: ["每份支付 1 美元", "一文不值", "退款"], answer: 1 },
    { q: "同一市场中“是”和“否”的价格之和约为…", options: ["1 美元", "2 美元", "由交易者决定"], answer: 0 },
    { q: "市场何时结算？", options: ["价格达到 99¢ 时", "公布的结算依据确认结果时", "30 天后"], answer: 1 },
  ],
};

export function Quiz() {
  const { t, locale } = useI18n();
  const questions = QUESTIONS[locale === "zh" ? "zh" : "en"];
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const score = answers.filter((a, i) => a === questions[i].answer).length;
  const passed = score >= 4;

  const check = () => {
    setChecked(true);
    if (answers.filter((a, i) => a === questions[i].answer).length >= 4) {
      try {
        localStorage.setItem("omx:learner-badge", "1");
      } catch {}
      toast({ title: t("learn.quiz.pass"), variant: "success" });
    }
  };

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold">{t("learn.quiz.title")}</h2>
      <p className="mt-1 text-sm text-muted">{t("learn.quiz.body")}</p>
      <ol className="mt-5 space-y-5">
        {questions.map((q, qi) => (
          <li key={qi}>
            <p className="mb-2 text-sm font-semibold">
              {qi + 1}. {q.q}
            </p>
            <div className="grid gap-1.5 sm:grid-cols-3" role="radiogroup" aria-label={q.q}>
              {q.options.map((o, oi) => {
                const selected = answers[qi] === oi;
                const correct = checked && oi === q.answer;
                const wrong = checked && selected && oi !== q.answer;
                return (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={checked}
                    onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      correct ? "border-yes bg-yes-soft text-yes" : wrong ? "border-no bg-no-soft text-no" : selected ? "border-brand bg-brand-soft" : "border-border hover:border-border-strong",
                    )}
                  >
                    {correct ? <CheckCircle2 className="size-4 shrink-0" /> : wrong ? <XCircle className="size-4 shrink-0" /> : <span className="size-4 shrink-0 rounded-full border border-current opacity-40" />}
                    {o}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!checked ? (
          <Button onClick={check} disabled={answers.some((a) => a === null)}>
            {t("learn.quiz.check")}
          </Button>
        ) : (
          <>
            <p className={cn("flex items-center gap-2 text-sm font-semibold", passed ? "text-yes" : "text-no")}>
              {passed && <Award className="size-5" />} {t("learn.quiz.score", { a: score, b: questions.length })}. {passed ? t("learn.quiz.pass") : t("learn.quiz.fail")}
            </p>
            {!passed && (
              <Button variant="outline" size="sm" onClick={() => { setChecked(false); setAnswers(questions.map(() => null)); }}>
                {t("learn.quiz.retry")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
