"use client";

import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { isSignedIn, useSession } from "@/store/session";

export function TryDemoButton() {
  const { user, openAuth } = useSession();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (isSignedIn(user) ? router.push("/portfolio") : openAuth())}
      className={buttonVariants({ variant: "outline", size: "lg" })}
    >
      <PlayCircle className="size-4 text-brand" />
      {isSignedIn(user) ? "Open your portfolio" : "Try demo trading"}
    </button>
  );
}
