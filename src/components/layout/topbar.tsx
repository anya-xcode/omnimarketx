"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { isSignedIn, useSession } from "@/store/session";
import { TourButton } from "@/components/onboarding/tour";
import { Logo } from "./logo";
import { PRIMARY_NAV, SECONDARY_NAV, isActivePath } from "./nav-config";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { useCommandPalette } from "./command-palette";

export function TopBar() {
  const { user, openAuth } = useSession();
  const { t } = useI18n();
  const open = useCommandPalette((s) => s.open);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const signedIn = isSignedIn(user);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={() => setMenu(true)}
          aria-label={t("nav.openMenu")}
          className="flex size-9 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-text lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div className="lg:hidden">
          <Logo />
        </div>

        <button
          type="button"
          onClick={open}
          data-tour="search"
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-text sm:ml-0 sm:w-full sm:max-w-md sm:justify-start sm:gap-2.5 sm:px-3.5"
          aria-label={t("top.searchAria")}
        >
          <Search className="size-4 shrink-0" />
          <span className="hidden flex-1 text-left text-sm sm:block">{t("top.search")}</span>
          <kbd className="hidden rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-medium text-faint sm:block">Ctrl K</kbd>
        </button>

        <div className="flex items-center gap-1.5 sm:ml-auto sm:gap-2">
          <LocaleSwitcher />
          <ThemeToggle variant="icon" className="hidden lg:hidden sm:flex" />
          {user && (
            <Link href="/portfolio" className="hidden items-center rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold tabular hover:bg-surface-3 md:flex">
              {formatMoney(user.balance, { compact: false })}
            </Link>
          )}
          {signedIn && user ? (
            <Link href="/portfolio" className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2.5 hover:bg-surface-2" aria-label={t("nav.portfolio")}>
              <Avatar name={user.name} color="var(--brand)" size={30} />
              <span className="hidden text-sm font-semibold md:block">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={openAuth} className="hidden sm:inline-flex">
                {t("top.signIn")}
              </Button>
              <Button size="sm" onClick={openAuth}>
                {t("top.signUp")}
              </Button>
            </>
          )}
        </div>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button type="button" aria-label={t("nav.closeMenu")} className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col bg-surface shadow-pop animate-[fade-up_0.2s_ease-out]">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo />
              <button type="button" onClick={() => setMenu(false)} aria-label={t("nav.closeMenu")} className="rounded-lg p-2 text-muted hover:bg-surface-2">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto p-3">
              {[PRIMARY_NAV, SECONDARY_NAV].map((group, gi) => (
                <div key={gi} className="space-y-0.5">
                  {group.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenu(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                          active ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-text",
                        )}
                      >
                        <item.icon className="size-[18px]" />
                        <span className="flex-1">{t(item.labelKey)}</span>
                      </Link>
                    );
                  })}
                  {gi === 1 && (
                    <div onClick={() => setMenu(false)}>
                      <TourButton className="py-2.5" />
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="space-y-3 border-t border-border p-3">
              {!signedIn && (
                <button type="button" onClick={() => { setMenu(false); openAuth(); }} className={buttonVariants({ className: "w-full" })}>
                  {t("top.signIn")} / {t("top.signUp")}
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
