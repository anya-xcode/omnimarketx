"use client";

import { Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTour } from "@/components/onboarding/tour";
import { useI18n } from "@/lib/i18n/client";

export function LearnTourLink() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        router.push("/");
        setTimeout(() => useTour.getState().start(), 500);
      }}
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
    >
      <Compass className="size-4" /> {t("learn.replayTour")}
    </button>
  );
}
