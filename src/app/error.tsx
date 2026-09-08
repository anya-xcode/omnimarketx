"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="card mx-auto mt-10 flex max-w-lg flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-no-soft text-no">
        <AlertTriangle className="size-6" />
      </span>
      <h1 className="text-base font-semibold">Something went wrong</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">We couldn&apos;t load this page. It&apos;s usually temporary.</p>
      {error.digest && <p className="mt-2 font-mono text-[11px] text-faint">Ref {error.digest}</p>}
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
