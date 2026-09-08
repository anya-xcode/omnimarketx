import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/primitives";

export default function MarketNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="We couldn't find that market"
      description="It may have been removed or the link is out of date. Browse the open markets instead."
      action={{ label: "Browse markets", href: "/markets" }}
      className="mx-auto max-w-lg"
    />
  );
}
