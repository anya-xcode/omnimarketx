import { expect, test } from "@playwright/test";

test.describe("OmniMarketX redesign", () => {
  test("home renders server-side content without a loading spinner", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Trade what");
    await expect(page.getByRole("heading", { name: "Trending markets" })).toBeVisible();
    const html = await res!.text();
    expect(html).toContain("Trending markets");
    expect(html).not.toContain("Loading OmniMarketX");
  });

  test("markets page filters by category and search via the URL", async ({ page }) => {
    await page.goto("/markets?category=crypto");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Crypto");
    await page.getByLabel("Filter markets").fill("bitcoin");
    await expect(page).toHaveURL(/q=bitcoin/);
    await expect(page.getByRole("article").first()).toContainText(/bitcoin/i);
  });

  test("market page shows chart, rules and lets a demo user trade", async ({ page, isMobile }) => {
    await page.goto("/markets/will-bitcoin-btc-reach-a-new-all-time-high-before-31-december-2026?outcome=yes");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Bitcoin");
    await expect(page.getByRole("heading", { name: "Rules and resolution" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Price history" })).toBeVisible({ timeout: 15_000 });

    // On mobile the trade panel lives in a bottom sheet; on desktop it's the sticky side rail.
    let panel = page.getByRole("region", { name: "Trade" });
    if (isMobile) {
      await page.getByRole("button", { name: /Buy Yes/ }).click();
      panel = page.getByRole("dialog").getByRole("region", { name: "Trade" });
    }
    await panel.getByLabel("Amount").fill("25");
    await panel.getByRole("button", { name: /^Buy Yes/ }).click();
    await expect(page.getByRole("status").filter({ hasText: /Bought/ })).toBeVisible({ timeout: 10_000 });

    await page.goto("/portfolio");
    await expect(page.getByRole("heading", { name: "Open positions" })).toBeVisible();
    await expect(page.getByRole("table").first()).toContainText("Bitcoin");
  });

  test("command palette searches markets", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcut is desktop-only");
    await page.goto("/");
    await page.keyboard.press("Control+K");
    const box = page.getByRole("combobox", { name: "Search" });
    await expect(box).toBeVisible();
    await box.fill("ethereum");
    await expect(page.getByRole("option", { name: /Ethereum/ }).first()).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/ethereum/);
  });

  test("api responds with json envelopes", async ({ request }) => {
    const health = await request.get("/api/health");
    expect(health.ok()).toBeTruthy();
    const markets = await request.get("/api/markets?category=sports&limit=3");
    const body = await markets.json();
    expect(body.ok).toBe(true);
    expect(body.data.items.length).toBeLessThanOrEqual(3);
    expect(body.data.items.every((m: { category: string }) => m.category === "sports")).toBe(true);
    const bad = await request.post("/api/trades", { data: { slug: "nope", outcomeId: "yes", side: "buy", amount: 5 } });
    expect(bad.status()).toBe(404);
  });

  test("unknown market shows a friendly 404", async ({ page }) => {
    const res = await page.goto("/markets/this-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("We couldn't find that market")).toBeVisible();
  });
});
