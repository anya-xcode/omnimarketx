import type { BlogPost, CategoryId, FeedPost, Group, Market, MarketKind, Outcome, Trader } from "@/lib/types";
import { generateHistory } from "@/lib/history";
import { changeBetween, primaryOutcome } from "@/lib/pricing";

type SeedMarket = {
  slug: string;
  title: string;
  subtitle?: string;
  category: CategoryId;
  icon: string;
  region?: string;
  /** binary: yes probability; multi: label -> probability */
  yes?: number;
  options?: Record<string, number>;
  volume: number;
  traders: number;
  liquidity?: number;
  createdAt: string;
  closesAt: string;
  resolution: string;
  sources: string[];
  tags: string[];
  featured?: boolean;
};

const RAW: SeedMarket[] = [
  {
    slug: "will-bitcoin-btc-reach-a-new-all-time-high-before-31-december-2026",
    title: "Will Bitcoin (BTC) reach a new all-time high before 31 December 2026?",
    category: "crypto", icon: "🪙", yes: 0.62, volume: 1_284_300, traders: 4_812, liquidity: 240_000,
    createdAt: "2026-07-02T09:00:00Z", closesAt: "2026-12-31T23:59:00Z", featured: true,
    resolution: "Resolves YES if Bitcoin trades at a price above its previous all-time high on any major exchange before 31 December 2026, 23:59 UTC, according to the approved resolution sources. Otherwise resolves NO.",
    sources: ["CoinMarketCap BTC price", "CoinGecko BTC price"], tags: ["bitcoin", "btc", "ath"],
  },
  {
    slug: "will-ethereum-eth-close-above-us-5-000-by-31-december-2026",
    title: "Will Ethereum (ETH) close above US$5,000 by 31 December 2026?",
    category: "crypto", icon: "💎", yes: 0.41, volume: 642_900, traders: 2_301, liquidity: 150_000,
    createdAt: "2026-07-02T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if the daily close price of ETH/USD on 31 December 2026 is strictly above US$5,000 according to the resolution sources.",
    sources: ["CoinMarketCap ETH price", "CoinGecko ETH price"], tags: ["ethereum", "eth"],
  },
  {
    slug: "will-bnb-close-above-us-1-500-by-31-december-2026",
    title: "Will BNB close above US$1,500 by 31 December 2026?",
    category: "crypto", icon: "🟡", yes: 0.28, volume: 188_400, traders: 903, liquidity: 60_000,
    createdAt: "2026-07-10T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if the daily close price of BNB/USD on 31 December 2026 is strictly above US$1,500.",
    sources: ["CoinMarketCap BNB price"], tags: ["bnb", "binance"],
  },
  {
    slug: "will-solana-flip-ethereum-in-market-cap-in-2026",
    title: "Will Solana flip Ethereum in market cap before the end of 2026?",
    category: "crypto", icon: "🌞", yes: 0.07, volume: 96_200, traders: 611, liquidity: 40_000,
    createdAt: "2026-08-01T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if SOL's total market capitalisation exceeds ETH's at any daily close before 31 December 2026.",
    sources: ["CoinMarketCap market cap rankings"], tags: ["solana", "flippening"],
  },
  {
    slug: "who-will-win-the-2028-united-states-presidential-election",
    title: "Who will win the 2028 United States Presidential Election?",
    category: "politics", icon: "🇺🇸", region: "US", volume: 3_920_000, traders: 12_440, liquidity: 600_000, featured: true,
    options: { "JD Vance": 0.31, "Gavin Newsom": 0.22, "Marco Rubio": 0.09, "Gretchen Whitmer": 0.08, "Alexandria Ocasio-Cortez": 0.07, "Josh Shapiro": 0.06, "Ron DeSantis": 0.05, "Other": 0.12 },
    createdAt: "2026-07-16T09:00:00Z", closesAt: "2028-11-07T04:00:00Z",
    resolution: "Resolves to the candidate who wins the Electoral College, is certified as President-elect, and is inaugurated on 20 January 2029. If no listed candidate wins, resolves to Other.",
    sources: ["Federal Election Commission", "Congressional certification of the Electoral College vote"], tags: ["election", "usa", "2028"],
  },
  {
    slug: "will-andy-burnham-remain-prime-minister-of-the-united-kingdom-through-31-december-2026",
    title: "Will Andy Burnham remain Prime Minister of the United Kingdom through 31 December 2026?",
    category: "politics", icon: "🇬🇧", region: "GB", yes: 0.84, volume: 512_700, traders: 1_988, liquidity: 120_000,
    createdAt: "2026-07-20T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if Andy Burnham holds the office of Prime Minister continuously through 31 December 2026, 23:59 GMT.",
    sources: ["gov.uk", "BBC News"], tags: ["uk", "prime minister"],
  },
  {
    slug: "will-xi-jinping-visit-india-for-the-2026-brics-summit",
    title: "Will Xi Jinping visit India for the 2026 BRICS Summit?",
    category: "politics", icon: "🤝", region: "IN", yes: 0.57, volume: 233_100, traders: 1_120, liquidity: 80_000,
    createdAt: "2026-08-05T09:00:00Z", closesAt: "2026-11-30T23:59:00Z",
    resolution: "Resolves YES if Xi Jinping attends the 2026 BRICS Summit in India in person.",
    sources: ["Ministry of External Affairs, India", "Xinhua"], tags: ["brics", "india", "china"],
  },
  {
    slug: "will-another-nationwide-neet-paper-leak-be-officially-confirmed-before-31-december-2026",
    title: "Will another nationwide NEET paper leak be officially confirmed before 31 December 2026?",
    category: "politics", icon: "📝", region: "IN", yes: 0.23, volume: 74_800, traders: 540, liquidity: 30_000,
    createdAt: "2026-08-12T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if the National Testing Agency or a court of record officially confirms a nationwide NEET question-paper leak before 31 December 2026.",
    sources: ["National Testing Agency", "Supreme Court of India orders"], tags: ["neet", "india", "education"],
  },
  {
    slug: "will-former-macc-chief-commissioner-azam-baki-s-lawsuit-conclude-by-31-december-2026",
    title: "Will former MACC Chief Commissioner Azam Baki's lawsuit conclude by 31 December 2026?",
    category: "politics", icon: "⚖️", region: "MY", yes: 0.35, volume: 41_300, traders: 302, liquidity: 20_000,
    createdAt: "2026-08-15T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if a final judgment is delivered in the lawsuit before 31 December 2026 (Malaysia time).",
    sources: ["Malaysian judiciary e-filing records", "Bernama"], tags: ["malaysia", "macc"],
  },
  {
    slug: "will-the-fed-cut-rates-at-the-december-2026-fomc-meeting",
    title: "Will the Fed cut rates at the December 2026 FOMC meeting?",
    category: "economy", icon: "🏦", yes: 0.48, volume: 2_104_000, traders: 6_720, liquidity: 400_000, featured: true,
    createdAt: "2026-07-01T09:00:00Z", closesAt: "2026-12-16T19:00:00Z",
    resolution: "Resolves YES if the FOMC lowers the target federal funds rate range at its December 2026 meeting.",
    sources: ["Federal Reserve press release"], tags: ["fed", "rates", "fomc"],
  },
  {
    slug: "will-us-cpi-inflation-be-below-3-percent-in-november-2026",
    title: "Will US CPI inflation (YoY) be below 3% for November 2026?",
    category: "economy", icon: "🛒", yes: 0.61, volume: 388_500, traders: 1_402, liquidity: 90_000,
    createdAt: "2026-08-01T09:00:00Z", closesAt: "2026-12-10T13:30:00Z",
    resolution: "Resolves YES if the BLS headline CPI-U year-over-year figure for November 2026 is below 3.0%.",
    sources: ["U.S. Bureau of Labor Statistics"], tags: ["cpi", "inflation"],
  },
  {
    slug: "will-gold-close-above-us-4-000-per-ounce-by-31-december-2026",
    title: "Will gold close above US$4,000/oz by 31 December 2026?",
    category: "economy", icon: "🥇", yes: 0.44, volume: 296_000, traders: 1_015, liquidity: 90_000,
    createdAt: "2026-07-22T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if the LBMA PM gold price fixes above US$4,000 per troy ounce on any day before 31 December 2026.",
    sources: ["LBMA"], tags: ["gold", "commodities"],
  },
  {
    slug: "will-india-gdp-growth-exceed-7-percent-in-fy2026-27",
    title: "Will India's real GDP growth exceed 7% in FY2026-27?",
    category: "economy", icon: "🇮🇳", region: "IN", yes: 0.46, volume: 121_700, traders: 688, liquidity: 50_000,
    createdAt: "2026-08-20T09:00:00Z", closesAt: "2027-05-31T23:59:00Z",
    resolution: "Resolves YES if the provisional estimate for FY2026-27 real GDP growth published by MOSPI exceeds 7.0%.",
    sources: ["Ministry of Statistics and Programme Implementation"], tags: ["india", "gdp"],
  },
  {
    slug: "who-will-win-the-india-vs-brazil-friendly",
    title: "Who will win the India vs Brazil friendly on 3 October 2026?",
    category: "sports", icon: "⚽", region: "IN", volume: 402_300, traders: 2_960, liquidity: 90_000,
    options: { Brazil: 0.78, Draw: 0.14, India: 0.08 },
    createdAt: "2026-08-25T09:00:00Z", closesAt: "2026-10-03T14:00:00Z",
    resolution: "Resolves to the result after 90 minutes plus stoppage time. Extra time and penalties are not counted.",
    sources: ["FIFA match report"], tags: ["football", "india", "brazil"],
  },
  {
    slug: "which-team-will-win-the-2026-27-premier-league",
    title: "Which team will win the 2026-27 Premier League?",
    category: "sports", icon: "🏆", region: "GB", volume: 1_740_000, traders: 5_214, liquidity: 300_000, featured: true,
    options: { "Manchester City": 0.34, Arsenal: 0.3, Liverpool: 0.21, Chelsea: 0.07, "Other": 0.08 },
    createdAt: "2026-08-01T09:00:00Z", closesAt: "2027-05-23T18:00:00Z",
    resolution: "Resolves to the club officially declared champion by the Premier League at the end of the 2026-27 season.",
    sources: ["Premier League official standings"], tags: ["epl", "football"],
  },
  {
    slug: "will-india-win-the-2027-icc-cricket-world-cup",
    title: "Will India win the 2027 ICC Cricket World Cup?",
    category: "sports", icon: "🏏", region: "IN", yes: 0.27, volume: 612_000, traders: 3_105, liquidity: 140_000,
    createdAt: "2026-08-10T09:00:00Z", closesAt: "2027-11-30T23:59:00Z",
    resolution: "Resolves YES if India wins the final of the 2027 ICC Men's Cricket World Cup.",
    sources: ["International Cricket Council"], tags: ["cricket", "world cup"],
  },
  {
    slug: "clash-of-the-titans-ang-woei-shang-vs-hew-kuan-yau",
    title: "Clash of the Titans: Ang Woei Shang vs Hew Kuan Yau, who wins the bout?",
    subtitle: "键盘恩怨，擂台解决 - 洪伟翔 VS 邱光耀（超人）",
    category: "sports", icon: "🥊", region: "MY", volume: 58_900, traders: 421, liquidity: 25_000,
    options: { "Ang Woei Shang": 0.46, "Hew Kuan Yau": 0.38, "Draw / No contest": 0.16 },
    createdAt: "2026-08-28T09:00:00Z", closesAt: "2026-11-15T12:00:00Z",
    resolution: "Resolves to the winner announced by the event organiser. A cancelled event resolves to Draw / No contest.",
    sources: ["Event organiser announcement"], tags: ["boxing", "malaysia"],
  },
  {
    slug: "will-avengers-doomsday-earn-at-least-250-million-worldwide-during-its-opening-weekend",
    title: "Will Avengers: Doomsday earn at least $250M worldwide in its opening weekend?",
    category: "entertainment", icon: "🎬", yes: 0.66, volume: 447_100, traders: 2_012, liquidity: 100_000,
    createdAt: "2026-07-30T09:00:00Z", closesAt: "2026-12-20T23:59:00Z",
    resolution: "Resolves YES if the worldwide opening-weekend gross reported by Box Office Mojo is at least US$250,000,000.",
    sources: ["Box Office Mojo"], tags: ["marvel", "box office"],
  },
  {
    slug: "will-avengers-doomsday-gross-at-least-1-billion-worldwide-by-january-31-2027",
    title: "Will Avengers: Doomsday gross at least $1B worldwide by 31 January 2027?",
    category: "entertainment", icon: "🦸", yes: 0.74, volume: 385_400, traders: 1_744, liquidity: 100_000,
    createdAt: "2026-07-30T09:00:00Z", closesAt: "2027-01-31T23:59:00Z",
    resolution: "Resolves YES if cumulative worldwide gross reported by Box Office Mojo reaches US$1,000,000,000 by 31 January 2027.",
    sources: ["Box Office Mojo"], tags: ["marvel", "box office"],
  },
  {
    slug: "will-ramayana-part-one-gross-at-least-1-500-crore-worldwide",
    title: "Will Ramayana: Part One gross at least ₹1,500 crore worldwide?",
    category: "entertainment", icon: "🏹", region: "IN", yes: 0.52, volume: 276_900, traders: 1_402, liquidity: 80_000,
    createdAt: "2026-08-02T09:00:00Z", closesAt: "2027-01-15T23:59:00Z",
    resolution: "Resolves YES if the film's worldwide gross reaches ₹1,500 crore according to Sacnilk within 60 days of release.",
    sources: ["Sacnilk", "Producer-reported figures"], tags: ["bollywood", "box office"],
  },
  {
    slug: "will-openai-release-gpt-6-before-31-december-2026",
    title: "Will OpenAI publicly release GPT-6 before 31 December 2026?",
    category: "tech", icon: "🧠", yes: 0.37, volume: 918_000, traders: 3_870, liquidity: 200_000, featured: true,
    createdAt: "2026-07-05T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if a model officially named GPT-6 is generally available to the public via ChatGPT or the API before 31 December 2026.",
    sources: ["OpenAI official announcements"], tags: ["openai", "ai"],
  },
  {
    slug: "will-apple-announce-a-foldable-iphone-in-2026",
    title: "Will Apple announce a foldable iPhone in 2026?",
    category: "tech", icon: "📱", yes: 0.29, volume: 331_200, traders: 1_510, liquidity: 90_000,
    createdAt: "2026-07-18T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if Apple officially announces a foldable iPhone at any event or press release before 31 December 2026.",
    sources: ["Apple Newsroom"], tags: ["apple", "iphone"],
  },
  {
    slug: "will-spacex-starship-complete-an-orbital-refueling-test-in-2026",
    title: "Will SpaceX Starship complete an orbital propellant transfer test in 2026?",
    category: "tech", icon: "🚀", yes: 0.55, volume: 204_600, traders: 980, liquidity: 70_000,
    createdAt: "2026-08-08T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if SpaceX or NASA confirms a successful ship-to-ship propellant transfer in orbit before 31 December 2026.",
    sources: ["SpaceX", "NASA"], tags: ["spacex", "starship"],
  },
  {
    slug: "will-grand-theft-auto-vi-launch-before-31-may-2027",
    title: "Will Grand Theft Auto VI launch before 31 May 2027?",
    category: "gaming", icon: "🎮", yes: 0.71, volume: 1_030_000, traders: 4_420, liquidity: 220_000, featured: true,
    createdAt: "2026-07-03T09:00:00Z", closesAt: "2027-05-31T23:59:00Z",
    resolution: "Resolves YES if GTA VI is available for purchase and playable by the general public on at least one platform before 31 May 2027.",
    sources: ["Rockstar Games Newswire"], tags: ["gta", "rockstar"],
  },
  {
    slug: "will-the-psa-10-pikachu-illustrator-sell-for-more-than-us-18-000-000-before-31-december-2026",
    title: "Will a PSA 10 Pikachu Illustrator card sell for more than US$18M before 31 December 2026?",
    category: "gaming", icon: "⚡", yes: 0.18, volume: 67_300, traders: 388, liquidity: 25_000,
    createdAt: "2026-08-14T09:00:00Z", closesAt: "2026-12-31T23:59:00Z",
    resolution: "Resolves YES if a verified public sale of a PSA 10 Pikachu Illustrator exceeds US$18,000,000 before 31 December 2026.",
    sources: ["PWCC / Heritage / Goldin auction records"], tags: ["pokemon", "collectibles"],
  },
  {
    slug: "will-nintendo-switch-2-sell-more-than-25-million-units-in-2026",
    title: "Will Nintendo Switch 2 sell more than 25 million units in 2026?",
    category: "gaming", icon: "🕹️", yes: 0.58, volume: 152_800, traders: 812, liquidity: 60_000,
    createdAt: "2026-08-22T09:00:00Z", closesAt: "2027-02-05T23:59:00Z",
    resolution: "Resolves YES if Nintendo's reported cumulative Switch 2 sell-through for calendar 2026 exceeds 25 million units.",
    sources: ["Nintendo investor relations"], tags: ["nintendo", "switch"],
  },
];

function slugId(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildOutcomes(m: SeedMarket): { kind: MarketKind; outcomes: Outcome[] } {
  if (m.options) {
    const outcomes = Object.entries(m.options).map(([label, price]) => ({ id: slugId(label), label, price }));
    return { kind: "multi", outcomes };
  }
  const yes = m.yes ?? 0.5;
  return {
    kind: "binary",
    outcomes: [
      { id: "yes", label: "Yes", price: yes },
      { id: "no", label: "No", price: Number((1 - yes).toFixed(4)) },
    ],
  };
}

export function buildSeedMarkets(now = Date.now()): Market[] {
  return RAW.map((m, i) => {
    const { kind, outcomes } = buildOutcomes(m);
    const history = generateHistory(m.slug, outcomes, 90, now);
    const primary = primaryOutcome({ kind, outcomes });
    const change24h = Number(changeBetween(history, primary.id, 24 * 3_600_000).toFixed(4));
    const ageDays = Math.max(1, (now - new Date(m.createdAt).getTime()) / 86_400_000);
    const trendScore = Math.round(m.volume / Math.sqrt(ageDays) + Math.abs(change24h) * 400_000 + m.traders * 20);
    return {
      id: `mkt_${String(i + 1).padStart(3, "0")}`,
      slug: m.slug,
      title: m.title,
      subtitle: m.subtitle,
      category: m.category,
      kind,
      icon: m.icon,
      outcomes,
      volume: m.volume,
      traders: m.traders,
      liquidity: m.liquidity ?? Math.round(m.volume * 0.2),
      change24h,
      createdAt: m.createdAt,
      closesAt: m.closesAt,
      status: "open",
      resolution: m.resolution,
      resolutionSources: m.sources,
      tags: m.tags,
      featured: m.featured,
      region: m.region,
      history,
      trendScore,
    };
  });
}

export const SEED_FEED: FeedPost[] = [
  {
    id: "post_001",
    author: { name: "Priya Raman", handle: "priyatrades", avatarColor: "#f0286b", verified: true },
    body: "Fed cut odds sitting at 48% feels too low after this morning's jobs print. Loaded up on YES, the market is under-reacting to the labour data.",
    marketSlug: "will-the-fed-cut-rates-at-the-december-2026-fomc-meeting",
    likes: 128, comments: 24, reposts: 11, createdAt: "2026-09-08T06:10:00Z",
  },
  {
    id: "post_002",
    author: { name: "Marcus Chen", handle: "mchen", avatarColor: "#6d4aff" },
    body: "GTA VI at 71% before May 2027. Rockstar has slipped every date for a decade, but Take-Two's guidance is unusually firm this cycle. Holding.",
    marketSlug: "will-grand-theft-auto-vi-launch-before-31-may-2027",
    likes: 86, comments: 19, reposts: 6, createdAt: "2026-09-07T21:40:00Z",
  },
  {
    id: "post_003",
    author: { name: "Aisha Rahman", handle: "aisha_r", avatarColor: "#10b981", verified: true },
    body: "The BTC all-time-high market just crossed 60%. If you have been waiting for a dip to buy NO, the spread is the widest it has been since July.",
    marketSlug: "will-bitcoin-btc-reach-a-new-all-time-high-before-31-december-2026",
    likes: 214, comments: 41, reposts: 29, createdAt: "2026-09-07T15:05:00Z",
  },
  {
    id: "post_004",
    author: { name: "Daniel Okafor", handle: "dokafor", avatarColor: "#f59e0b" },
    body: "Newsom at 22% for 2028 is the most interesting price on the board right now. Two years is a long time, but the field is thinner than the market implies.",
    marketSlug: "who-will-win-the-2028-united-states-presidential-election",
    likes: 57, comments: 33, reposts: 4, createdAt: "2026-09-06T11:22:00Z",
  },
  {
    id: "post_005",
    author: { name: "Sofia Martins", handle: "sofiam", avatarColor: "#06b6d4" },
    body: "Brazil at 78% against India is fair, but Draw at 14% in a friendly with heavy rotation looks cheap. Small position.",
    marketSlug: "who-will-win-the-india-vs-brazil-friendly",
    likes: 39, comments: 8, reposts: 2, createdAt: "2026-09-05T18:00:00Z",
  },
  {
    id: "post_006",
    author: { name: "Kenji Watanabe", handle: "kenji_w", avatarColor: "#8b5cf6" },
    body: "Nobody is talking about the Switch 2 volume market. 25M units in year one is aggressive even for Nintendo. Bought NO at 42¢.",
    marketSlug: "will-nintendo-switch-2-sell-more-than-25-million-units-in-2026",
    likes: 22, comments: 5, reposts: 1, createdAt: "2026-09-04T09:30:00Z",
  },
];

export const SEED_TRADERS: Trader[] = [
  { id: "t01", name: "Aisha Rahman", handle: "aisha_r", avatarColor: "#10b981", roi: 0.842, pnl: 48_210, volume: 312_000, winRate: 0.71, trades: 412, streak: 9, verified: true, categories: ["crypto", "economy"] },
  { id: "t02", name: "Priya Raman", handle: "priyatrades", avatarColor: "#f0286b", roi: 0.613, pnl: 31_940, volume: 268_500, winRate: 0.66, trades: 388, streak: 4, verified: true, categories: ["economy", "politics"] },
  { id: "t03", name: "Marcus Chen", handle: "mchen", avatarColor: "#6d4aff", roi: 0.578, pnl: 27_105, volume: 190_200, winRate: 0.64, trades: 301, streak: 6, categories: ["gaming", "tech"] },
  { id: "t04", name: "Daniel Okafor", handle: "dokafor", avatarColor: "#f59e0b", roi: 0.421, pnl: 19_880, volume: 221_000, winRate: 0.6, trades: 276, streak: 2, categories: ["politics"] },
  { id: "t05", name: "Sofia Martins", handle: "sofiam", avatarColor: "#06b6d4", roi: 0.395, pnl: 14_320, volume: 98_400, winRate: 0.63, trades: 190, streak: 5, categories: ["sports"] },
  { id: "t06", name: "Kenji Watanabe", handle: "kenji_w", avatarColor: "#8b5cf6", roi: 0.352, pnl: 11_045, volume: 87_900, winRate: 0.58, trades: 164, streak: 1, categories: ["gaming", "entertainment"] },
  { id: "t07", name: "Lena Fischer", handle: "lenaf", avatarColor: "#ef4444", roi: 0.318, pnl: 9_870, volume: 76_300, winRate: 0.61, trades: 142, streak: 3, categories: ["economy"] },
  { id: "t08", name: "Ravi Patel", handle: "ravip", avatarColor: "#3b82f6", roi: 0.287, pnl: 8_410, volume: 112_000, winRate: 0.55, trades: 205, streak: 0, verified: true, categories: ["sports", "entertainment"] },
  { id: "t09", name: "Chloe Dubois", handle: "chloed", avatarColor: "#ec4899", roi: 0.244, pnl: 6_120, volume: 54_100, winRate: 0.59, trades: 98, streak: 2, categories: ["tech"] },
  { id: "t10", name: "Omar Haddad", handle: "omarh", avatarColor: "#14b8a6", roi: 0.201, pnl: 4_980, volume: 61_800, winRate: 0.54, trades: 121, streak: 1, categories: ["crypto"] },
  { id: "t11", name: "Nur Aisyah", handle: "nuraisyah", avatarColor: "#f97316", roi: 0.176, pnl: 3_310, volume: 38_700, winRate: 0.57, trades: 74, streak: 4, categories: ["politics", "sports"] },
  { id: "t12", name: "Tomás Silva", handle: "tsilva", avatarColor: "#a3e635", roi: 0.142, pnl: 2_640, volume: 41_200, winRate: 0.52, trades: 88, streak: 0, categories: ["sports"] },
];

export const SEED_BLOG: BlogPost[] = [
  { slug: "prediction-markets-vs-gambling", title: "Prediction markets vs gambling: what is the difference?", excerpt: "Both involve money and uncertainty, but prediction markets price information. Here is why that matters for how you trade.", category: "Learn", gradient: "linear-gradient(135deg,#f0286b,#6d4aff)", emoji: "🎯", author: "OmniMarketX Team", publishedAt: "2026-08-28T09:00:00Z", readMinutes: 4, featured: true },
  { slug: "how-to-read-a-market-price", title: "How to read a market price (and why 62¢ means 62%)", excerpt: "A one-page explainer on share pricing, payouts and what the probability on every card actually represents.", category: "Getting started", gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)", emoji: "📊", author: "OmniMarketX Team", publishedAt: "2026-08-21T09:00:00Z", readMinutes: 3 },
  { slug: "omnimarketx-vs-polymarket-vs-kalshi", title: "OmniMarketX vs Polymarket vs Kalshi", excerpt: "Fees, settlement, social features and coverage. A frank comparison of the three biggest event-trading platforms in 2026.", category: "Market insights", gradient: "linear-gradient(135deg,#f59e0b,#ef4444)", emoji: "⚖️", author: "Naman Sompura", publishedAt: "2026-08-14T09:00:00Z", readMinutes: 6 },
  { slug: "invite-and-earn-explained", title: "Invite & Earn: how the 2-10% commission tiers work", excerpt: "Everything you need to know about referral tiers, eligible activity and how commissions are paid out monthly.", category: "Product", gradient: "linear-gradient(135deg,#10b981,#06b6d4)", emoji: "🎁", author: "OmniMarketX Team", publishedAt: "2026-08-07T09:00:00Z", readMinutes: 3 },
  { slug: "sports-betting-is-changing", title: "Sports betting is changing: why prediction markets are next", excerpt: "From fixed odds to live probability. How event markets are reshaping the way fans trade on sport.", category: "Sports", gradient: "linear-gradient(135deg,#22c55e,#0f766e)", emoji: "⚽", author: "OmniMarketX Team", publishedAt: "2026-07-30T09:00:00Z", readMinutes: 5 },
  { slug: "where-are-prediction-markets-legal", title: "Where are prediction markets legal in 2026?", excerpt: "A country-by-country look at the regulatory picture across the US, EU, India and Southeast Asia.", category: "World events", gradient: "linear-gradient(135deg,#6366f1,#a855f7)", emoji: "🌍", author: "OmniMarketX Team", publishedAt: "2026-07-23T09:00:00Z", readMinutes: 7 },
];

export const SEED_GROUPS: Group[] = [
  { id: "g1", name: "Crypto Signals", description: "Daily on-chain reads and macro catalysts for BTC, ETH and SOL markets.", members: 4_120, category: "crypto", emoji: "🪙" },
  { id: "g2", name: "Election Watch 2028", description: "Polling, primaries and Electoral College maths, argued politely.", members: 2_870, category: "politics", emoji: "🗳️" },
  { id: "g3", name: "Box Office Predictors", description: "Opening-weekend tracking, tracking-firm leaks and studio rumours.", members: 1_540, category: "entertainment", emoji: "🎬" },
  { id: "g4", name: "Football Markets", description: "Premier League, Champions League and international friendlies.", members: 3_305, category: "sports", emoji: "⚽" },
];
