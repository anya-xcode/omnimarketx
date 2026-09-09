"use client";

import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";
import { isSignedIn, useSession } from "@/store/session";

export function TryDemoButton() {
  const { user, openAuth } = useSession();
  const { t } = useI18n();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (isSignedIn(user) ? router.push("/portfolio") : openAuth())}
      className={buttonVariants({ variant: "outline", size: "lg" })}
    >
      <PlayCircle className="size-4 text-brand" />
      {isSignedIn(user) ? t("home.openPortfolio") : t("home.tryDemo")}
    </button>
  );
}
