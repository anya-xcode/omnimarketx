import { expect, test } from "@playwright/test";

test.describe("OmniMarketX redesign", () => {
  // The guided tour auto-opens for first-time visitors; mark it done so it doesn't block clicks.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("omx:tour-done", "1"));
  });

  test("home renders server-side content without a loading spinner", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Trade what");
    const tabs = page.getByRole("tablist", { name: "Market lists" });
    await expect(tabs).toBeVisible();
    await expect(page.getByRole("tabpanel").getByRole("article").first()).toBeVisible();
    const html = await res!.text();
    expect(html).toContain("Market movers");
    expect(html).not.toContain("Loading OmniMarketX");

    // Tabs swap the rail client-side.
    await tabs.getByRole("tab", { name: "Closing soon" }).click();
    await expect(page.getByRole("tabpanel").getByRole("article").first()).toBeVisible({ timeout: 10_000 });
  });

  test("guided tour opens for first-time visitors and can be completed", async ({ page }) => {
    // Simulate a first visit: clear the flag once, then let the app persist dismissal across the reload below.
    await page.addInitScript(() => {
      if (!sessionStorage.getItem("omx-e2e-cleared")) {
        localStorage.removeItem("omx:tour-done");
        sessionStorage.setItem("omx-e2e-cleared", "1");
      }
    });
    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: "Welcome to OmniMarketX" });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await dialog.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("dialog", { name: "Every card is a question" })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Dismissal is remembered.
    await page.reload();
    await page.waitForTimeout(1500);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("language switcher translates the interface and market titles", async ({ page, isMobile }) => {
    await page.goto("/markets");
    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("option", { name: /中文/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("所有市场", { timeout: 15_000 });
    await expect(page.getByRole("article").first()).toContainText("已翻译");
    if (!isMobile) await expect(page.getByRole("link", { name: "市场", exact: true }).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
    // Back to English via the API-backed cookie.
    await page.getByRole("button", { name: "语言" }).click();
    await page.getByRole("option", { name: /English/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("All markets", { timeout: 15_000 });
  });

  test("learn page has lessons, a calculator and a passable quiz", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("five minutes");
    await expect(page.getByRole("heading", { name: "Payout calculator" })).toBeVisible();
    // Answer the quiz correctly: options 1, 2, 2, 1, 2 (1-indexed).
    const answers = ["The market thinks there is a 62% chance of Yes", "$10", "They pay nothing", "$1", "When the published resolution source confirms the outcome"];
    for (const a of answers) await page.getByRole("radio", { name: a, exact: true }).click();
    await page.getByRole("button", { name: "Check answers" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Learner badge earned" })).toBeVisible();
  });

  test("support assistant answers fixed questions and hands off to a human with a reply time", async ({ page }) => {
    await page.goto("/learn");
    await page.getByRole("button", { name: "Chat with us" }).click();
    const panel = page.getByRole("dialog", { name: "Omni Assistant" });
    await expect(panel).toBeVisible();
    // Option buttons on the opening message.
    await panel.getByRole("button", { name: "How do I start?" }).click();
    await expect(panel.getByText("Three steps")).toBeVisible({ timeout: 5_000 });
    await expect(panel.getByRole("link", { name: /Read more/ }).first()).toBeVisible();
    // Free text: the exact question the live bot failed on.
    await panel.getByLabel("Type a question…").fill("explain me that platform");
    await panel.getByRole("button", { name: "Send" }).click();
    await expect(panel.getByText("social prediction market")).toBeVisible({ timeout: 5_000 });
    // Human hand-off with hours and a ticket.
    await panel.getByRole("button", { name: "Talk to a human" }).first().click();
    await expect(panel.getByText(/replies within 2 hours/)).toBeVisible({ timeout: 5_000 });
    await panel.getByLabel("Your question").fill("Can I use a Malaysian bank account?");
    await panel.getByRole("button", { name: "Send to the team" }).click();
    await expect(panel.getByText(/Your ticket is #/)).toBeVisible({ timeout: 10_000 });
  });

  test("watchlist star adds a market to the watchlist page", async ({ page }) => {
    await page.goto("/markets/will-openai-release-gpt-6-before-31-december-2026");
    const star = page.getByRole("button", { name: "Add to watchlist" }).first();
    await expect(star).toBeVisible();
    await star.click();
    await expect(page.getByRole("status").filter({ hasText: "Added to watchlist" })).toBeVisible();
    await page.goto("/watchlist");
    await expect(page.getByRole("article").first()).toContainText("GPT-6");
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
    const badLocale = await request.post("/api/locale", { data: { locale: "xx" } });
    expect(badLocale.status()).toBe(400);
  });

  test("unknown market shows a friendly 404", async ({ page }) => {
    const res = await page.goto("/markets/this-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("We couldn't find that market")).toBeVisible();
  });
});
