"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { PRIMARY_NAV, isActivePath } from "./nav-config";

const ITEMS = PRIMARY_NAV.filter((i) => ["/", "/markets", "/trending", "/leaderboard", "/portfolio"].includes(i.href));

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-tour={item.tour}
                className={cn("flex flex-col items-center gap-1 py-2 text-[11px] font-medium", active ? "text-brand" : "text-muted")}
              >
                <item.icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                <span className="max-w-full truncate px-1">{item.href === "/leaderboard" ? t("nav.leaderboardShort") : t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
