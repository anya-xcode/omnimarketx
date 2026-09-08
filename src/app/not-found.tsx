import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={{ label: "Back to home", href: "/" }}
      className="mx-auto mt-10 max-w-lg"
    />
  );
}
