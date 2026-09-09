/**
 * Fixed answers for the support assistant. The bot matches these first (quick-reply buttons
 * and keyword matching on free text) and only offers a human when nothing fits.
 * Everything here is content, not code: editing an answer is a one-line change.
 */
export interface FaqEntry {
  id: string;
  /** Shown on the quick-reply button and as the user's message when clicked. */
  question: { en: string; zh: string };
  /** Lower-case keywords / phrases. Multi-word phrases score higher than single words. */
  keywords: string[];
  answer: { en: string; zh: string };
  /** "Read more" target so short answers never dead-end. */
  link: { href: string; label: { en: string; zh: string } };
  /** Show as a quick-reply option on the opening message. */
  quick?: boolean;
}

export const FAQ: FaqEntry[] = [
  {
    id: "start",
    quick: true,
    question: { en: "How do I start?", zh: "我该如何开始？" },
    keywords: ["start", "begin", "get started", "how to use", "new here", "first time", "onboard", "开始", "怎么用", "新手"],
    answer: {
      en: "Three steps: 1) Pick any market on the Markets page. 2) Tap Yes or No and enter an amount, you already have $10,000 in demo funds. 3) Watch your position in Portfolio. No deposit, email or wallet is needed to try it.",
      zh: "三步即可：1）在“市场”页选择任意市场；2）点击“是”或“否”并输入金额，您已经拥有 10,000 美元模拟资金；3）在“投资组合”中查看持仓。试用无需充值、邮箱或钱包。",
    },
    link: { href: "/learn", label: { en: "Read the 5-minute guide", zh: "阅读五分钟指南" } },
  },
  {
    id: "what",
    quick: true,
    question: { en: "What is OmniMarketX?", zh: "OmniMarketX 是什么？" },
    keywords: ["what is", "explain", "about", "platform", "omnimarketx", "prediction market", "what does", "是什么", "介绍", "平台"],
    answer: {
      en: "OmniMarketX is a social prediction market. Each market asks a question about a real event, and the price of a Yes share is the crowd's live probability. You buy shares in the outcome you expect, they pay $1 each if you're right, and you can discuss your reasoning with other traders on Pulse.",
      zh: "OmniMarketX 是一个社交型预测市场。每个市场就一个真实事件提问，“是”份额的价格就是大众的实时概率。您买入自己看好的结果，猜对每份支付 1 美元，还可以在社区与其他交易者讨论观点。",
    },
    link: { href: "/learn", label: { en: "How prediction markets work", zh: "预测市场如何运作" } },
  },
  {
    id: "demo",
    quick: true,
    question: { en: "How does demo trading work?", zh: "模拟交易是怎么回事？" },
    keywords: ["demo", "practice", "paper trading", "fake money", "virtual", "simulation", "test trading", "模拟", "练习", "虚拟"],
    answer: {
      en: "Every visitor gets a $10,000 demo balance automatically. Trades use that balance, move market prices just like real ones, and show up in your Portfolio and the Activity feed. Nothing you do in demo mode involves real money, so it's the safest way to learn.",
      zh: "每位访客都会自动获得 10,000 美元模拟余额。交易使用该余额，会像真实交易一样影响市场价格，并显示在您的投资组合和动态中。模拟模式不涉及任何真实资金，是最安全的学习方式。",
    },
    link: { href: "/portfolio", label: { en: "Open your portfolio", zh: "打开投资组合" } },
  },
  {
    id: "deposit-needed",
    quick: true,
    question: { en: "Do I need to deposit money?", zh: "我需要充值吗？" },
    keywords: ["need to deposit", "have to deposit", "need money", "free", "cost", "pay", "is it free", "要充值吗", "免费", "需要钱"],
    answer: {
      en: "No. You can browse every market, trade with the demo balance, post on Pulse and climb the leaderboard without depositing anything. Real-money trading is optional and only available once you've verified your account.",
      zh: "不需要。您可以浏览所有市场、用模拟余额交易、在社区发帖并登上排行榜，全程无需充值。真实资金交易是可选的，且只在完成账户验证后开放。",
    },
    link: { href: "/subscription", label: { en: "Compare Free and Pro", zh: "比较免费版与 Pro" } },
  },
  {
    id: "deposit-withdraw",
    quick: true,
    question: { en: "How do I deposit or withdraw?", zh: "如何充值或提现？" },
    keywords: ["deposit", "withdraw", "withdrawal", "cash out", "add funds", "top up", "payment", "bank", "crypto wallet", "充值", "提现", "取款", "付款"],
    answer: {
      en: "Deposits and withdrawals live under Portfolio → Wallet once real-money trading is enabled for your account. Supported methods are bank transfer, card and USDT. Withdrawals are processed within 1 business day. In this demo build the wallet is simulated.",
      zh: "账户开通真实交易后，在“投资组合 → 钱包”中即可充值和提现。支持银行转账、银行卡和 USDT。提现在 1 个工作日内处理。当前演示版本中的钱包为模拟。",
    },
    link: { href: "/portfolio", label: { en: "Go to wallet", zh: "前往钱包" } },
  },
  {
    id: "social",
    quick: true,
    question: { en: "How do the social and market features work together?", zh: "社交和市场功能如何结合？" },
    keywords: ["social", "post", "feed", "pulse", "community", "follow", "share", "comment", "群组", "社区", "发帖", "动态"],
    answer: {
      en: "Pulse is the community feed. When you post, you can attach a market so readers see the live price next to your reasoning. Follow top predictors from the Leaderboard, join Groups for topics you care about, and star markets to build a Watchlist.",
      zh: "“社区”是动态信息流。发帖时可以附上一个市场，读者在您的观点旁就能看到实时价格。您可以从排行榜关注顶级预测者，加入感兴趣的小组，并给市场加星建立自选列表。",
    },
    link: { href: "/feed", label: { en: "Open Pulse", zh: "打开社区" } },
  },
  {
    id: "price",
    question: { en: "What does the price mean?", zh: "价格是什么意思？" },
    keywords: ["price", "62", "cents", "probability", "odds", "percent", "chance", "mean", "价格", "概率", "赔率"],
    answer: {
      en: "The price of a Yes share is the crowd's probability. Yes at 62¢ means the market thinks there's a 62% chance the event happens. Yes and No always add up to about $1, and every share pays $1 if it wins.",
      zh: "“是”份额的价格就是大众概率。62¢ 表示市场认为事件发生的概率为 62%。“是”和“否”合计约为 1 美元，获胜的份额每份支付 1 美元。",
    },
    link: { href: "/learn", label: { en: "Try the payout calculator", zh: "试试收益计算器" } },
  },
  {
    id: "resolve",
    question: { en: "How do markets resolve?", zh: "市场如何结算？" },
    keywords: ["resolve", "resolution", "settle", "settlement", "outcome", "who decides", "source", "结算", "结果", "裁定"],
    answer: {
      en: "Every market page lists its resolution rules and the official source used (for example the Federal Reserve press release or Box Office Mojo). When the source confirms the outcome, winning shares are paid $1 each and losing shares go to zero. Ambiguous markets can resolve N/A with all positions refunded.",
      zh: "每个市场页面都列出了结算规则和采用的官方来源（例如美联储公告或 Box Office Mojo）。来源确认结果后，获胜份额每份支付 1 美元，失败份额归零。结果有争议的市场可能判定为 N/A 并退还所有仓位。",
    },
    link: { href: "/legal/integrity", label: { en: "Market integrity policy", zh: "市场诚信政策" } },
  },
  {
    id: "sell",
    question: { en: "Can I sell before a market ends?", zh: "市场结束前可以卖出吗？" },
    keywords: ["sell", "exit", "close position", "before it ends", "early", "lock in", "卖出", "平仓", "提前"],
    answer: {
      en: "Yes. Open the market, switch the trade panel to Sell, and choose how many shares to sell at the current price. You can lock in a profit or cut a loss any time before the market closes.",
      zh: "可以。打开市场，把交易面板切换到“卖出”，选择按当前价格卖出的份额数量。市场截止前随时可以锁定利润或止损。",
    },
    link: { href: "/learn", label: { en: "Lesson: selling early", zh: "课程：提前卖出" } },
  },
  {
    id: "account",
    question: { en: "How do I sign up or log in?", zh: "如何注册或登录？" },
    keywords: ["sign up", "signup", "register", "log in", "login", "account", "password", "email", "注册", "登录", "账号"],
    answer: {
      en: "Tap Sign up in the top bar, choose a display name and your preferred language, and you're in. No password or email is needed for the demo. Your balance, watchlist and language are remembered on this device.",
      zh: "点击顶部的“注册”，设置昵称和首选语言即可。演示版无需密码或邮箱。您的余额、自选和语言会保存在此设备上。",
    },
    link: { href: "/portfolio", label: { en: "See your account", zh: "查看我的账户" } },
  },
  {
    id: "language",
    question: { en: "Can I change the language?", zh: "可以更改语言吗？" },
    keywords: ["language", "chinese", "english", "translate", "translation", "malay", "hindi", "语言", "中文", "翻译"],
    answer: {
      en: "Yes. Use the globe icon in the top bar to switch between English, 中文, Bahasa Melayu and हिन्दी. The whole interface and market titles change, and translated titles show a small badge with the original on hover.",
      zh: "可以。使用顶部的地球图标在英语、中文、马来语和印地语之间切换。整个界面和市场标题都会更改，翻译后的标题会显示小徽章，悬停可查看原文。",
    },
    link: { href: "/learn", label: { en: "Learn page in your language", zh: "查看学习页面" } },
  },
  {
    id: "leaderboard",
    question: { en: "How does the leaderboard work?", zh: "排行榜如何运作？" },
    keywords: ["leaderboard", "rank", "ranking", "reward", "prize", "roi", "top traders", "排行", "排名", "奖励"],
    answer: {
      en: "Traders are ranked by ROI (realised profit divided by capital deployed) over the selected period, with volume as the tiebreaker. Demo trades count. The monthly reward pool is shared among the top ranks.",
      zh: "交易者按所选周期内的 ROI（已实现利润 ÷ 投入资金）排名，成交量为并列时的次要标准。模拟交易也计入。每月奖励池由前几名分享。",
    },
    link: { href: "/leaderboard", label: { en: "View the leaderboard", zh: "查看排行榜" } },
  },
  {
    id: "safety",
    question: { en: "Is my money safe?", zh: "我的资金安全吗？" },
    keywords: ["safe", "safety", "secure", "security", "scam", "legit", "trust", "risk", "安全", "可靠", "风险"],
    answer: {
      en: "Demo balances are simulated, so there is nothing at risk while you learn. For real-money accounts, funds are held in segregated accounts, every market publishes its rules before trading opens, and our risk disclosure explains what can go wrong.",
      zh: "模拟余额是虚拟的，学习过程中没有任何风险。真实账户的资金采用隔离存管，每个市场在开放交易前都会公布规则，风险披露文件说明了可能的风险。",
    },
    link: { href: "/legal/risk", label: { en: "Read the risk disclosure", zh: "阅读风险披露" } },
  },
];

export const HUMAN_OPTION = {
  id: "human",
  question: { en: "Talk to a human", zh: "联系人工客服" },
  keywords: ["human", "agent", "person", "real person", "support team", "someone", "representative", "人工", "客服", "真人"],
} as const;

/** Support hours shown with the human hand-off so people know when to expect a reply. */
export const SUPPORT_HOURS = { timezone: "MYT", open: "9am", close: "6pm", replyWithin: "2 hours" };
