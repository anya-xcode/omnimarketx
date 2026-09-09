"use client";

import { useState } from "react";
import { formatCents, formatMoney, formatPct } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { quote } from "@/lib/pricing";

export function PayoutCalculator() {
  const { t } = useI18n();
  const [amount, setAmount] = useState(100);
  const [price, setPrice] = useState(0.62);
  const q = quote(amount, price);

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold">{t("learn.calc.title")}</h2>
      <p className="mt-1 text-sm text-muted">{t("learn.calc.body")}</p>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <label htmlFor="calc-amount" className="font-semibold">{t("learn.calc.amount")}</label>
              <span className="font-bold tabular">{formatMoney(amount, { compact: false })}</span>
            </div>
            <input id="calc-amount" type="range" min={5} max={1000} step={5} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <label htmlFor="calc-price" className="font-semibold">{t("learn.calc.price")}</label>
              <span className="font-bold tabular">{formatCents(price)} · {formatPct(price)}</span>
            </div>
            <input id="calc-price" type="range" min={0.01} max={0.99} step={0.01} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
            <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-no-soft">
              <div className="h-full bg-yes transition-[width]" style={{ width: `${price * 100}%` }} />
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">{t("learn.calc.shares")}</dt><dd className="mt-0.5 text-xl font-bold tabular">{q.shares.toFixed(2)}</dd></div>
          <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">{t("learn.calc.payout")}</dt><dd className="mt-0.5 text-xl font-bold tabular">{formatMoney(q.payout, { compact: false })}</dd></div>
          <div className="rounded-xl bg-yes-soft p-3"><dt className="text-xs text-yes">{t("learn.calc.profit")}</dt><dd className="mt-0.5 text-xl font-bold tabular text-yes">+{formatMoney(q.profit, { compact: false })} <span className="text-xs">({formatPct(q.roi)})</span></dd></div>
          <div className="rounded-xl bg-no-soft p-3"><dt className="text-xs text-no">{t("learn.calc.loss")}</dt><dd className="mt-0.5 text-xl font-bold tabular text-no">-{formatMoney(amount, { compact: false })}</dd></div>
        </dl>
      </div>
    </div>
  );
}
