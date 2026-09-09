import { describe, expect, it } from "vitest";
import { matchQuestion } from "@/lib/support-match";
import { FAQ } from "@/data/support-faq";

function id(msg: string) {
  const r = matchQuestion(msg);
  return r.kind === "answer" ? r.entry.id : r.kind;
}

describe("support assistant matching", () => {
  it("answers the two questions the live site's bot failed on", () => {
    expect(id("how can i start ?")).toBe("start");
    expect(id("explain me that platform")).toBe("what");
  });
  it("matches paraphrases and typos-tolerant phrasing", () => {
    expect(id("I'm new here, what do I do first?")).toBe("start");
    expect(id("is it free or do I have to deposit money")).toBe("deposit-needed");
    expect(id("how do I withdraw my winnings to my bank")).toBe("deposit-withdraw");
    expect(id("what does 62 cents mean")).toBe("price");
    expect(id("can I sell my shares early")).toBe("sell");
    expect(id("change language to chinese")).toBe("language");
  });
  it("routes requests for a person to the human hand-off", () => {
    expect(id("I want to talk to a real person")).toBe("human");
    expect(id("can i speak to an agent")).toBe("human");
  });
  it("returns suggestions instead of a wrong answer when nothing fits", () => {
    const r = matchQuestion("purple elephants dancing");
    expect(r.kind).toBe("none");
    if (r.kind === "none") expect(r.suggestions.length).toBeGreaterThan(0);
  });
  it("has a read-more link and both languages for every entry", () => {
    for (const f of FAQ) {
      expect(f.link.href.startsWith("/")).toBe(true);
      expect(f.answer.zh.length).toBeGreaterThan(10);
      expect(f.question.zh.length).toBeGreaterThan(2);
      expect(f.keywords.length).toBeGreaterThan(2);
    }
    expect(FAQ.length).toBeGreaterThanOrEqual(10);
  });
});
