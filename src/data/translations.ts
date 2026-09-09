import type { Locale } from "@/lib/i18n";

/**
 * Market title translations keyed by slug. In production these live on the market
 * document (author-provided or machine-translated and reviewed); for the demo they
 * ship with the seed so every locale gets a readable title.
 */
export const MARKET_TITLES: Record<string, Partial<Record<Exclude<Locale, "en">, string>>> = {
  "will-bitcoin-btc-reach-a-new-all-time-high-before-31-december-2026": { zh: "比特币（BTC）会在 2026 年 12 月 31 日前创下历史新高吗？", ms: "Adakah Bitcoin (BTC) akan mencapai paras tertinggi baharu sebelum 31 Disember 2026?", hi: "क्या बिटकॉइन (BTC) 31 दिसंबर 2026 से पहले नया ऑल-टाइम हाई बनाएगा?" },
  "will-ethereum-eth-close-above-us-5-000-by-31-december-2026": { zh: "以太坊（ETH）会在 2026 年 12 月 31 日收于 5,000 美元以上吗？", ms: "Adakah Ethereum (ETH) akan ditutup melebihi US$5,000 menjelang 31 Disember 2026?", hi: "क्या Ethereum (ETH) 31 दिसंबर 2026 तक US$5,000 से ऊपर बंद होगा?" },
  "will-bnb-close-above-us-1-500-by-31-december-2026": { zh: "BNB 会在 2026 年 12 月 31 日收于 1,500 美元以上吗？", ms: "Adakah BNB akan ditutup melebihi US$1,500 menjelang 31 Disember 2026?", hi: "क्या BNB 31 दिसंबर 2026 तक US$1,500 से ऊपर बंद होगा?" },
  "will-solana-flip-ethereum-in-market-cap-in-2026": { zh: "Solana 会在 2026 年底前市值超越以太坊吗？", ms: "Adakah Solana akan mengatasi Ethereum dalam permodalan pasaran sebelum akhir 2026?", hi: "क्या 2026 के अंत से पहले Solana मार्केट कैप में Ethereum को पीछे छोड़ देगा?" },
  "who-will-win-the-2028-united-states-presidential-election": { zh: "谁将赢得 2028 年美国总统大选？", ms: "Siapa akan memenangi Pilihan Raya Presiden Amerika Syarikat 2028?", hi: "2028 का अमेरिकी राष्ट्रपति चुनाव कौन जीतेगा?" },
  "will-andy-burnham-remain-prime-minister-of-the-united-kingdom-through-31-december-2026": { zh: "安迪·伯纳姆会在 2026 年 12 月 31 日前一直担任英国首相吗？", ms: "Adakah Andy Burnham kekal sebagai Perdana Menteri UK sehingga 31 Disember 2026?", hi: "क्या एंडी बर्नहम 31 दिसंबर 2026 तक यूके के प्रधानमंत्री बने रहेंगे?" },
  "will-xi-jinping-visit-india-for-the-2026-brics-summit": { zh: "习近平会赴印度出席 2026 年金砖国家峰会吗？", ms: "Adakah Xi Jinping akan melawat India untuk Sidang Kemuncak BRICS 2026?", hi: "क्या शी जिनपिंग 2026 ब्रिक्स शिखर सम्मेलन के लिए भारत आएँगे?" },
  "will-another-nationwide-neet-paper-leak-be-officially-confirmed-before-31-december-2026": { zh: "2026 年 12 月 31 日前会再次官方确认全国性 NEET 泄题事件吗？", ms: "Adakah kebocoran kertas NEET seluruh negara yang lain akan disahkan secara rasmi sebelum 31 Disember 2026?", hi: "क्या 31 दिसंबर 2026 से पहले एक और राष्ट्रव्यापी NEET पेपर लीक की आधिकारिक पुष्टि होगी?" },
  "will-former-macc-chief-commissioner-azam-baki-s-lawsuit-conclude-by-31-december-2026": { zh: "前反贪会主席阿占巴基的诉讼会在 2026 年 12 月 31 日前结案吗？", ms: "Adakah saman bekas Ketua Pesuruhjaya SPRM Azam Baki akan selesai menjelang 31 Disember 2026?", hi: "क्या पूर्व MACC प्रमुख आज़म बाकी का मुकदमा 31 दिसंबर 2026 तक समाप्त होगा?" },
  "will-the-fed-cut-rates-at-the-december-2026-fomc-meeting": { zh: "美联储会在 2026 年 12 月 FOMC 会议上降息吗？", ms: "Adakah Fed akan menurunkan kadar pada mesyuarat FOMC Disember 2026?", hi: "क्या फेड दिसंबर 2026 की FOMC बैठक में दरें घटाएगा?" },
  "will-us-cpi-inflation-be-below-3-percent-in-november-2026": { zh: "2026 年 11 月美国 CPI 同比通胀率会低于 3% 吗？", ms: "Adakah inflasi CPI AS (tahunan) akan berada di bawah 3% untuk November 2026?", hi: "क्या नवंबर 2026 में अमेरिकी CPI मुद्रास्फीति (वार्षिक) 3% से नीचे रहेगी?" },
  "will-gold-close-above-us-4-000-per-ounce-by-31-december-2026": { zh: "黄金会在 2026 年 12 月 31 日前收于每盎司 4,000 美元以上吗？", ms: "Adakah emas akan ditutup melebihi US$4,000/auns menjelang 31 Disember 2026?", hi: "क्या सोना 31 दिसंबर 2026 तक US$4,000/औंस से ऊपर बंद होगा?" },
  "will-india-gdp-growth-exceed-7-percent-in-fy2026-27": { zh: "印度 2026-27 财年实际 GDP 增速会超过 7% 吗？", ms: "Adakah pertumbuhan KDNK sebenar India melebihi 7% pada TK2026-27?", hi: "क्या वित्त वर्ष 2026-27 में भारत की वास्तविक GDP वृद्धि 7% से अधिक होगी?" },
  "who-will-win-the-india-vs-brazil-friendly": { zh: "2026 年 10 月 3 日印度对巴西的友谊赛谁会赢？", ms: "Siapa akan memenangi perlawanan persahabatan India lwn Brazil pada 3 Oktober 2026?", hi: "3 अक्टूबर 2026 को भारत बनाम ब्राज़ील फ्रेंडली कौन जीतेगा?" },
  "which-team-will-win-the-2026-27-premier-league": { zh: "哪支球队会赢得 2026-27 赛季英超冠军？", ms: "Pasukan mana akan memenangi Liga Perdana 2026-27?", hi: "2026-27 प्रीमियर लीग कौन सी टीम जीतेगी?" },
  "will-india-win-the-2027-icc-cricket-world-cup": { zh: "印度会赢得 2027 年 ICC 板球世界杯吗？", ms: "Adakah India akan memenangi Piala Dunia Kriket ICC 2027?", hi: "क्या भारत 2027 ICC क्रिकेट विश्व कप जीतेगा?" },
  "clash-of-the-titans-ang-woei-shang-vs-hew-kuan-yau": { zh: "世纪之战：洪伟翔 VS 邱光耀，谁会获胜？", ms: "Pertembungan Gergasi: Ang Woei Shang lwn Hew Kuan Yau, siapa menang?", hi: "क्लैश ऑफ द टाइटन्स: आंग वोई शांग बनाम ह्यू कुआन याउ, कौन जीतेगा?" },
  "will-avengers-doomsday-earn-at-least-250-million-worldwide-during-its-opening-weekend": { zh: "《复仇者联盟：末日》首周末全球票房会达到 2.5 亿美元吗？", ms: "Adakah Avengers: Doomsday akan meraih sekurang-kurangnya $250J di seluruh dunia pada hujung minggu pembukaan?", hi: "क्या Avengers: Doomsday ओपनिंग वीकेंड में दुनिया भर में कम से कम $250M कमाएगी?" },
  "will-avengers-doomsday-gross-at-least-1-billion-worldwide-by-january-31-2027": { zh: "《复仇者联盟：末日》会在 2027 年 1 月 31 日前全球票房达到 10 亿美元吗？", ms: "Adakah Avengers: Doomsday akan mencecah $1B di seluruh dunia menjelang 31 Januari 2027?", hi: "क्या Avengers: Doomsday 31 जनवरी 2027 तक दुनिया भर में $1B कमाएगी?" },
  "will-ramayana-part-one-gross-at-least-1-500-crore-worldwide": { zh: "《罗摩衍那：第一部》全球票房会达到 1,500 千万卢比吗？", ms: "Adakah Ramayana: Part One akan mencecah ₹1,500 crore di seluruh dunia?", hi: "क्या Ramayana: Part One दुनिया भर में कम से कम ₹1,500 करोड़ कमाएगी?" },
  "will-openai-release-gpt-6-before-31-december-2026": { zh: "OpenAI 会在 2026 年 12 月 31 日前公开发布 GPT-6 吗？", ms: "Adakah OpenAI akan mengeluarkan GPT-6 secara terbuka sebelum 31 Disember 2026?", hi: "क्या OpenAI 31 दिसंबर 2026 से पहले GPT-6 सार्वजनिक रूप से जारी करेगा?" },
  "will-apple-announce-a-foldable-iphone-in-2026": { zh: "苹果会在 2026 年发布可折叠 iPhone 吗？", ms: "Adakah Apple akan mengumumkan iPhone boleh lipat pada 2026?", hi: "क्या Apple 2026 में फोल्डेबल iPhone की घोषणा करेगा?" },
  "will-spacex-starship-complete-an-orbital-refueling-test-in-2026": { zh: "SpaceX 星舰会在 2026 年完成在轨推进剂转移测试吗？", ms: "Adakah SpaceX Starship akan menyelesaikan ujian pemindahan propelan orbit pada 2026?", hi: "क्या SpaceX Starship 2026 में ऑर्बिटल प्रोपेलेंट ट्रांसफर टेस्ट पूरा करेगा?" },
  "will-grand-theft-auto-vi-launch-before-31-may-2027": { zh: "《侠盗猎车手 VI》会在 2027 年 5 月 31 日前发售吗？", ms: "Adakah Grand Theft Auto VI akan dilancarkan sebelum 31 Mei 2027?", hi: "क्या Grand Theft Auto VI 31 मई 2027 से पहले लॉन्च होगा?" },
  "will-the-psa-10-pikachu-illustrator-sell-for-more-than-us-18-000-000-before-31-december-2026": { zh: "PSA 10 皮卡丘插画师卡会在 2026 年 12 月 31 日前以超过 1,800 万美元成交吗？", ms: "Adakah kad Pikachu Illustrator PSA 10 akan dijual melebihi US$18J sebelum 31 Disember 2026?", hi: "क्या PSA 10 Pikachu Illustrator कार्ड 31 दिसंबर 2026 से पहले US$18M से अधिक में बिकेगा?" },
  "will-nintendo-switch-2-sell-more-than-25-million-units-in-2026": { zh: "任天堂 Switch 2 在 2026 年销量会超过 2,500 万台吗？", ms: "Adakah Nintendo Switch 2 akan terjual melebihi 25 juta unit pada 2026?", hi: "क्या Nintendo Switch 2 2026 में 2.5 करोड़ से अधिक यूनिट बेचेगा?" },
};

/** Title in the requested locale, and whether it is a translation of the original. */
export function localizedTitle(slug: string, title: string, locale: Locale): { title: string; translated: boolean } {
  if (locale === "en") return { title, translated: false };
  const tr = MARKET_TITLES[slug]?.[locale];
  return tr ? { title: tr, translated: true } : { title, translated: false };
}
