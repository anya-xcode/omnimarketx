"use client";

import { Suspense, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { NavProgress } from "./nav-progress";
import { Tour } from "@/components/onboarding/tour";
import { useSession } from "@/store/session";
import { Toaster } from "@/components/ui/toaster";
import { AuthModal } from "./auth-modal";
import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { Footer } from "./footer";

function SessionBoot() {
  const load = useSession((s) => s.load);
  useEffect(() => {
    void load();
  }, [load]);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionBoot />
      <Suspense fallback={null}>
        <NavProgress />
      </Suspense>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-fg"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <TopBar />
        <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          {children}
        </main>
        <Footer />
      </div>
      <MobileNav />
      <CommandPalette />
      <AuthModal />
      <Tour />
      <Toaster />
    </ThemeProvider>
  );
}
