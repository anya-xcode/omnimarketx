import { Activity, BarChart3, BookOpen, Briefcase, Crown, Flame, Home, LayoutGrid, MessageSquare, Trophy, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home, description: "Featured and trending markets" },
  { href: "/markets", label: "Markets", icon: BarChart3, description: "Browse every open market" },
  { href: "/trending", label: "Trending", icon: Flame, description: "Most active right now" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, description: "Top predictors" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, description: "Positions and demo balance" },
  { href: "/activity", label: "Activity", icon: Activity, description: "Latest trades on the platform" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/feed", label: "Pulse", icon: MessageSquare, description: "What people are predicting" },
  { href: "/categories", label: "Categories", icon: LayoutGrid, description: "Markets by topic" },
  { href: "/blog", label: "Blog", icon: BookOpen, description: "Insights and guides" },
  { href: "/subscription", label: "OmniMarketX Pro", icon: Crown, description: "Plans and pricing" },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
