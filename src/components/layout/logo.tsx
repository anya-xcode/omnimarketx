import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="omx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7a45" />
          <stop offset="100%" stopColor="#f0286b" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#omx-g)" />
      <path d="M8.5 22V10.5l7.5 7 7.5-7V22" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-bold tracking-tight", className)} aria-label="OmniMarketX home">
      <LogoMark />
      {!compact && (
        <span className="text-[17px]">
          OmniMarket<span className="text-brand">X</span>
        </span>
      )}
    </Link>
  );
}
