"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/store/session";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    try {
      await api("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) });
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not subscribe");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-yes" role="status">
        <Check className="size-4" /> You&apos;re subscribed. Welcome aboard!
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row" noValidate>
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          aria-invalid={state === "error"}
          className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none placeholder:text-faint focus:border-brand"
        />
        {state === "error" && (
          <p className="mt-1 text-xs text-no" role="alert">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" loading={state === "busy"} className="h-11">
        Subscribe
      </Button>
    </form>
  );
}
