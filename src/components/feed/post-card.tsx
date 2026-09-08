import Link from "next/link";
import { BadgeCheck, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatPct, timeAgo } from "@/lib/format";
import { primaryOutcome } from "@/lib/pricing";
import type { FeedPost, MarketSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PostCard({ post, market, className }: { post: FeedPost; market?: MarketSummary; className?: string }) {
  return (
    <article className={cn("card p-4", className)}>
      <div className="flex items-center gap-3">
        <Avatar name={post.author.name} color={post.author.avatarColor} size={36} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold">
            <span className="truncate">{post.author.name}</span>
            {post.author.verified && <BadgeCheck className="size-3.5 shrink-0 text-accent" aria-label="Verified" />}
          </p>
          <p className="text-xs text-muted">
            @{post.author.handle} · <time dateTime={post.createdAt} suppressHydrationWarning>{timeAgo(post.createdAt)}</time>
          </p>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed">{post.body}</p>
      {market && (
        <Link href={`/markets/${market.slug}`} className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5 transition-colors hover:border-border-strong">
          <span className="text-lg" aria-hidden>{market.icon}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{market.title}</span>
          <span className="shrink-0 text-sm font-bold tabular text-brand">{formatPct(primaryOutcome(market).price)}</span>
        </Link>
      )}
      <div className="mt-3 flex items-center gap-5 text-xs font-medium text-muted">
        <span className="flex items-center gap-1.5"><Heart className="size-4" /> {post.likes}</span>
        <span className="flex items-center gap-1.5"><MessageCircle className="size-4" /> {post.comments}</span>
        <span className="flex items-center gap-1.5"><Repeat2 className="size-4" /> {post.reposts}</span>
      </div>
    </article>
  );
}
