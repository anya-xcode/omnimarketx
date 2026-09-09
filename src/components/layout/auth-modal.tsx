"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n";
import { useSession } from "@/store/session";
import { toast } from "@/store/toast";
import { LocaleSelect, saveLocale } from "./locale-switcher";

export function AuthModal() {
  const { authOpen, closeAuth, signIn } = useSession();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [lang, setLang] = useState<Locale>(locale);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (lang !== locale) await saveLocale(lang);
      const u = await signIn(name);
      toast({ title: t("auth.welcome", { name: u.name.split(" ")[0] }), description: t("auth.welcomeBody"), variant: "success" });
      setName("");
      if (lang !== locale) router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={authOpen} onClose={closeAuth} title={t("auth.title")}>
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm text-muted">{t("auth.body", { balance: "$10,000" })}</p>
        <div>
          <label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold">
            {t("auth.name")}
          </label>
          <input
            id="auth-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth.namePlaceholder")}
            autoComplete="nickname"
            maxLength={40}
            required
            className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors placeholder:text-faint focus:border-brand"
          />
          {error && (
            <p className="mt-1.5 text-xs font-medium text-no" role="alert">
              {error}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="auth-lang" className="mb-1.5 block text-sm font-semibold">
            {t("auth.language")}
          </label>
          <LocaleSelect id="auth-lang" value={lang} onChange={setLang} />
          <p className="mt-1 text-xs text-faint">{t("auth.languageHint")}</p>
        </div>
        <ul className="grid gap-2 text-xs text-muted sm:grid-cols-3">
          <li className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2"><Wallet className="size-3.5 text-brand" /> {t("auth.funds")}</li>
          <li className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2"><Sparkles className="size-3.5 text-brand" /> {t("auth.impact")}</li>
          <li className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2"><ShieldCheck className="size-3.5 text-brand" /> {t("auth.noMoney")}</li>
        </ul>
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={name.trim().length < 2}>
          {t("auth.continue")}
        </Button>
      </form>
    </Modal>
  );
}
