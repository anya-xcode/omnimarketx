import { Activity, BarChart3, BookOpen, Briefcase, Crown, Flame, GraduationCap, Home, LayoutGrid, MessageSquare, Star, Trophy, type LucideIcon } from "lucide-react";
import type { DictKey } from "@/lib/i18n";

export interface NavItem {
  href: string;
  labelKey: DictKey;
  /** English label, used for search and as a fallback. */
  label: string;
  icon: LucideIcon;
  description?: string;
  tour?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", labelKey: "nav.home", label: "Home", icon: Home, description: "Featured and trending markets" },
  { href: "/markets", labelKey: "nav.markets", label: "Markets", icon: BarChart3, description: "Browse every open market" },
  { href: "/trending", labelKey: "nav.trending", label: "Trending", icon: Flame, description: "Most active right now" },
  { href: "/leaderboard", labelKey: "nav.leaderboard", label: "Leaderboard", icon: Trophy, description: "Top predictors" },
  { href: "/portfolio", labelKey: "nav.portfolio", label: "Portfolio", icon: Briefcase, description: "Positions and demo balance", tour: "portfolio" },
  { href: "/watchlist", labelKey: "nav.watchlist", label: "Watchlist", icon: Star, description: "Markets you starred" },
  { href: "/activity", labelKey: "nav.activity", label: "Activity", icon: Activity, description: "Latest trades on the platform" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/learn", labelKey: "nav.learn", label: "Learn", icon: GraduationCap, description: "Prediction markets in five minutes" },
  { href: "/feed", labelKey: "nav.pulse", label: "Pulse", icon: MessageSquare, description: "What people are predicting" },
  { href: "/categories", labelKey: "nav.categories", label: "Categories", icon: LayoutGrid, description: "Markets by topic" },
  { href: "/blog", labelKey: "nav.blog", label: "Blog", icon: BookOpen, description: "Insights and guides" },
  { href: "/subscription", labelKey: "nav.pro", label: "OmniMarketX Pro", icon: Crown, description: "Plans and pricing" },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
