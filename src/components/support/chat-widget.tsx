"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Headset, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQ, HUMAN_OPTION, SUPPORT_HOURS, type FaqEntry } from "@/data/support-faq";
import { useI18n } from "@/lib/i18n/client";
import { matchQuestion } from "@/lib/support-match";
import { cn } from "@/lib/utils";
import { api } from "@/store/session";

type Lang = "en" | "zh";
type Msg = {
  id: string;
  role: "bot" | "user";
  text: string;
  link?: { href: string; label: string };
  /** FAQ ids (or "human") rendered as quick-reply buttons under the message. */
  options?: string[];
  form?: boolean;
};

const STORE_KEY = "omx:support";
const uid = () => Math.random().toString(36).slice(2, 9);

/**
 * Support assistant. Opens with clickable options, answers ~13 common questions from fixed
 * content (matched before anything else), links every answer to a help page, and keeps
 * "Talk to a human" as one option among several with a stated reply time.
 */
export function ChatWidget() {
  const { t, locale } = useI18n();
  const lang: Lang = locale === "zh" ? "zh" : "en";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [form, setForm] = useState({ email: "", message: "" });
  const [sending, setSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickIds = [...FAQ.filter((f) => f.quick).map((f) => f.id), HUMAN_OPTION.id];
  const labelFor = (id: string) => (id === HUMAN_OPTION.id ? HUMAN_OPTION.question[lang] : FAQ.find((f) => f.id === id)?.question[lang] ?? id);
  const hours = { open: SUPPORT_HOURS.open, close: SUPPORT_HOURS.close, tz: SUPPORT_HOURS.timezone, n: SUPPORT_HOURS.replyWithin };

  // Restore transcript; show the unread dot until the widget has been opened once.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { messages: Msg[] };
        if (saved.messages?.length) {
          const id = requestAnimationFrame(() => setMessages(saved.messages));
          return () => cancelAnimationFrame(id);
        }
      }
      const opened = localStorage.getItem("omx:support-seen");
      if (!opened) {
        const id = requestAnimationFrame(() => setSeen(false));
        return () => cancelAnimationFrame(id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (messages.length) sessionStorage.setItem(STORE_KEY, JSON.stringify({ messages }));
    } catch {}
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(id);
    };
  }, [open]);

  const greet = (): Msg[] => [
    { id: uid(), role: "bot", text: t("support.greeting") },
    { id: uid(), role: "bot", text: t("support.greeting2"), options: quickIds },
  ];

  const toggle = () => {
    setOpen((o) => !o);
    setSeen(true);
    try {
      localStorage.setItem("omx:support-seen", "1");
    } catch {}
    if (!open && messages.length === 0) setMessages(greet());
  };

  const botReply = (make: () => Msg[]) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, ...make()]);
    }, 450);
  };

  const followUps = (exclude: string) => [...FAQ.filter((f) => f.quick && f.id !== exclude).slice(0, 3).map((f) => f.id), HUMAN_OPTION.id];

  const answer = (entry: FaqEntry): Msg[] => [
    { id: uid(), role: "bot", text: entry.answer[lang], link: { href: entry.link.href, label: entry.link.label[lang] } },
    { id: uid(), role: "bot", text: t("support.moreQuestions"), options: followUps(entry.id) },
  ];

  const humanIntro = (): Msg[] => [{ id: uid(), role: "bot", text: t("support.human.intro", hours), form: true }];

  const choose = (id: string) => {
    setMessages((m) => [...m, { id: uid(), role: "user", text: labelFor(id) }]);
    if (id === HUMAN_OPTION.id) {
      botReply(humanIntro);
      return;
    }
    const entry = FAQ.find((f) => f.id === id);
    if (entry) botReply(() => answer(entry));
  };

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { id: uid(), role: "user", text }]);
    const result = matchQuestion(text);
    if (result.kind === "answer") botReply(() => answer(result.entry));
    else if (result.kind === "human") botReply(humanIntro);
    else {
      setForm((f) => ({ ...f, message: text }));
      botReply(() => [{ id: uid(), role: "bot", text: t("support.noMatch"), options: [...result.suggestions.map((s) => s.id), HUMAN_OPTION.id] }]);
    }
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const transcript = messages.map((m) => `${m.role}: ${m.text}`);
      const res = await api<{ ticket: { id: string } }>("/api/support", { method: "POST", body: JSON.stringify({ ...form, transcript }) });
      setMessages((m) => [...m.map((x) => (x.form ? { ...x, form: false } : x)), { id: uid(), role: "bot", text: t("support.human.sent", { id: res.ticket.id.slice(-6).toUpperCase(), n: hours.n }) }]);
      setForm({ email: "", message: "" });
    } catch (err) {
      setMessages((m) => [...m, { id: uid(), role: "bot", text: err instanceof Error ? err.message : t("support.human.error") }]);
    } finally {
      setSending(false);
    }
  };

  const restart = () => {
    setMessages(greet());
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {}
  };

  const onMarketPage = pathname.startsWith("/markets/");
  const bottom = cn(onMarketPage ? "bottom-[calc(8.75rem+env(safe-area-inset-bottom))]" : "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]", "lg:bottom-6");

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        data-tour="support"
        aria-expanded={open}
        aria-controls="support-panel"
        aria-label={open ? t("support.close") : t("support.open")}
        className={cn("fixed right-4 z-[60] flex size-13 items-center justify-center rounded-full bg-brand text-brand-fg shadow-pop transition-transform hover:scale-105 lg:right-6", bottom)}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!seen && !open && <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-surface bg-yes" aria-hidden />}
      </button>

      {open && (
        <div
          id="support-panel"
          role="dialog"
          aria-label={t("support.title")}
          className={cn("card fixed right-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden shadow-pop animate-fade-up lg:right-6", bottom, "mb-16 max-h-[min(640px,calc(100dvh-9rem))]")}
        >
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand to-accent px-4 py-3 text-white">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/20">
              <Headset className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">{t("support.title")}</p>
              <p className="truncate text-[11px] text-white/85">{t("support.status", hours)}</p>
            </div>
            <button type="button" onClick={restart} aria-label={t("support.restart")} title={t("support.restart")} className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white">
              <RotateCcw className="size-4" />
            </button>
          </div>

          <div ref={logRef} className="flex-1 space-y-3 overflow-y-auto bg-bg px-3 py-3" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[88%] space-y-2", m.role === "user" && "text-right")}>
                  <div className={cn("inline-block rounded-2xl px-3.5 py-2.5 text-left text-sm leading-relaxed", m.role === "user" ? "rounded-br-md bg-brand text-brand-fg" : "rounded-bl-md bg-surface text-text shadow-card")}>
                    {m.text}
                    {m.link && (
                      <Link href={m.link.href} onClick={() => setOpen(false)} className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                        {t("support.readMore")}: {m.link.label} <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                  {m.options && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.options.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => choose(id)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition-colors",
                            id === HUMAN_OPTION.id ? "border-accent/40 bg-accent-soft text-accent hover:brightness-95" : "border-border bg-surface text-text hover:border-brand hover:text-brand",
                          )}
                        >
                          {labelFor(id)}
                        </button>
                      ))}
                    </div>
                  )}
                  {m.form && (
                    <form onSubmit={submitTicket} className="card space-y-2 p-3 text-left">
                      <label className="block text-xs font-semibold" htmlFor="support-email">
                        {t("support.human.email")} <span className="font-normal text-faint">({t("support.human.emailOpt")})</span>
                      </label>
                      <input id="support-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-brand" />
                      <label className="block text-xs font-semibold" htmlFor="support-message">
                        {t("support.human.message")}
                      </label>
                      <textarea id="support-message" required minLength={3} rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full resize-none rounded-lg border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-brand" />
                      <Button type="submit" size="sm" className="w-full" loading={sending}>
                        {t("support.human.submit")}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start" aria-label={t("support.typing")}>
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-3.5 py-3 shadow-card">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-1.5 animate-bounce rounded-full bg-faint" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-surface p-2">
            <label htmlFor="support-input" className="sr-only">
              {t("support.placeholder")}
            </label>
            <input
              id="support-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("support.placeholder")}
              maxLength={300}
              className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand"
            />
            <button type="submit" aria-label={t("support.send")} disabled={!input.trim()} className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-fg disabled:opacity-40">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
