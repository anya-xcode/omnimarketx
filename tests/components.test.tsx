import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketCard } from "@/components/market/market-card";
import { buildSeedMarkets } from "@/data/seed";
import { toSummary } from "@/lib/market-query";

const markets = buildSeedMarkets(Date.parse("2026-09-08T12:00:00Z"));

describe("MarketCard", () => {
  it("renders a binary market with Yes/No actions and probability", () => {
    const m = toSummary(markets.find((x) => x.kind === "binary")!);
    render(<MarketCard market={m} />);
    expect(screen.getByRole("article", { name: m.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Yes/ })).toHaveAttribute("href", `/markets/${m.slug}?outcome=yes`);
    expect(screen.getByRole("link", { name: /^No/ })).toHaveAttribute("href", `/markets/${m.slug}?outcome=no`);
    expect(screen.getByText(/chance/)).toBeInTheDocument();
  });
  it("renders a multi-outcome market with a single outcomes action", () => {
    const m = toSummary(markets.find((x) => x.kind === "multi")!);
    render(<MarketCard market={m} />);
    expect(screen.getByRole("link", { name: new RegExp(`View ${m.outcomes.length} outcomes`) })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Yes/ })).toBeNull();
  });
});
