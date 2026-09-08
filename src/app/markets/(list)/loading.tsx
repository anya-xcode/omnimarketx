import { MarketCardSkeleton } from "@/components/market/market-card";

export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading markets">
      <div className="space-y-2">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-8 w-52" />
        <div className="skeleton h-4 w-72" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="skeleton h-16" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MarketCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
