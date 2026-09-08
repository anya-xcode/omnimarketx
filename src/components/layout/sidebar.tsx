"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { useSession } from "@/store/session";
import { Logo } from "./logo";
import { PRIMARY_NAV, SECONDARY_NAV, isActivePath, type NavItem } from "./nav-config";
import { ThemeToggle } from "./theme-toggle";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      <item.icon className={cn("size-[18px] shrink-0", active ? "text-brand" : "text-faint group-hover:text-text")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useSession((s) => s.user);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface lg:flex" aria-label="Primary">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
          ))}
        </div>
        <div>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Discover</p>
          <div className="space-y-0.5">
            {SECONDARY_NAV.map((item) => (
              <NavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
            ))}
          </div>
        </div>
      </nav>
      <div className="space-y-3 border-t border-border p-3">
        <Link href="/portfolio" className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5 transition-colors hover:bg-surface-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Wallet className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-medium text-muted">Demo balance</span>
            <span className="block text-sm font-bold tabular">{user ? formatMoney(user.balance, { compact: false }) : "—"}</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
