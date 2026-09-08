import type { Metadata, Viewport } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "OmniMarketX | Social prediction market", template: "%s | OmniMarketX" },
  description: "Trade what matters. Buy and sell shares in real-world outcomes across crypto, politics, sports, economy, entertainment, tech and gaming.",
  keywords: ["prediction market", "event trading", "crypto", "politics", "sports", "OmniMarketX"],
  openGraph: {
    type: "website",
    siteName: "OmniMarketX",
    title: "OmniMarketX | Social prediction market",
    description: "Trade on real-world events across sports, crypto, politics, finance and more.",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: "OmniMarketX", description: "Trade what matters." },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d14" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
