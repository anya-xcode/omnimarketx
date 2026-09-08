import { describe, expect, it } from "vitest";
import { formatCents, formatCompact, formatMoney, formatPct, formatSignedMoney, formatSignedPts, pluralize, timeAgo, timeUntil } from "@/lib/format";

describe("format helpers", () => {
  it("formats prices as cents", () => {
    expect(formatCents(0.62)).toBe("62¢");
    expect(formatCents(0.495)).toBe("49.5¢");
    expect(formatCents(1)).toBe("100¢");
  });
  it("formats percentages", () => {
    expect(formatPct(0.62)).toBe("62%");
    expect(formatPct(0.4567, 1)).toBe("45.7%");
  });
  it("formats signed probability points", () => {
    expect(formatSignedPts(0.031)).toBe("+3.1 pts");
    expect(formatSignedPts(-0.02)).toBe("-2.0 pts");
    expect(formatSignedPts(0)).toBe("0.0 pts");
  });
  it("formats money compactly above $1k", () => {
    expect(formatMoney(1_284_300)).toBe("$1.3M");
    expect(formatMoney(1_030_000)).toBe("$1M");
    expect(formatMoney(512_700)).toBe("$512.7K");
    expect(formatMoney(-2_500)).toBe("-$2.5K");
    expect(formatMoney(42.5)).toBe("$42.50");
    expect(formatMoney(10_000, { compact: false })).toBe("$10,000");
    expect(formatSignedMoney(-12.3)).toBe("-$12.30");
    expect(formatSignedMoney(5)).toBe("+$5.00");
  });
  it("pluralises with compact numbers", () => {
    expect(pluralize(1, "trader")).toBe("1 trader");
    expect(pluralize(4812, "trader")).toBe("4.8K traders");
    expect(formatCompact(999)).toBe("999");
  });
  it("describes time until close", () => {
    const now = new Date("2026-09-08T00:00:00Z");
    expect(timeUntil("2026-12-31T00:00:00Z", now)).toBe("4 months left");
    expect(timeUntil("2026-09-10T00:00:00Z", now)).toBe("2 days left");
    expect(timeUntil("2026-09-08T05:00:00Z", now)).toBe("5h left");
    expect(timeUntil("2026-09-01T00:00:00Z", now)).toBe("Closed");
  });
  it("describes time ago", () => {
    const now = new Date("2026-09-08T12:00:00Z");
    expect(timeAgo("2026-09-08T11:59:30Z", now)).toBe("just now");
    expect(timeAgo("2026-09-08T11:30:00Z", now)).toBe("30m ago");
    expect(timeAgo("2026-09-08T06:00:00Z", now)).toBe("6h ago");
    expect(timeAgo("2026-09-05T12:00:00Z", now)).toBe("3d ago");
  });
});
