import { FAQ, HUMAN_OPTION, type FaqEntry } from "@/data/support-faq";

export type MatchResult =
  | { kind: "answer"; entry: FaqEntry; score: number }
  | { kind: "human" }
  | { kind: "none"; suggestions: FaqEntry[] };

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Score an entry against a message: phrases count more than single words, and question-word overlap adds a little. */
export function scoreEntry(entry: Pick<FaqEntry, "keywords" | "question">, message: string) {
  const text = ` ${normalize(message)} `;
  let score = 0;
  for (const kw of entry.keywords) {
    const k = normalize(kw);
    if (!k) continue;
    const isPhrase = k.includes(" ") || /[㐀-鿿]/.test(k);
    if (text.includes(isPhrase ? k : ` ${k} `)) score += isPhrase ? 3 : 2;
    else if (isPhrase && k.split(" ").every((w) => text.includes(` ${w} `))) score += 2;
  }
  const words = new Set(normalize(entry.question.en).split(" ").filter((w) => w.length > 3));
  for (const w of words) if (text.includes(` ${w} `)) score += 0.5;
  return score;
}

/** Match free text to a fixed answer, the human hand-off, or nothing (with suggestions). */
export function matchQuestion(message: string, faq: FaqEntry[] = FAQ): MatchResult {
  const msg = message.trim();
  if (!msg) return { kind: "none", suggestions: faq.filter((f) => f.quick).slice(0, 3) };
  if (scoreEntry({ keywords: [...HUMAN_OPTION.keywords], question: HUMAN_OPTION.question }, msg) >= 2) return { kind: "human" };

  const scored = faq.map((entry) => ({ entry, score: scoreEntry(entry, msg) })).sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (best && best.score >= 2) return { kind: "answer", entry: best.entry, score: best.score };
  const suggestions = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.entry);
  return { kind: "none", suggestions: suggestions.length ? suggestions : faq.filter((f) => f.quick).slice(0, 3) };
}
