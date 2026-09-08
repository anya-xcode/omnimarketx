"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { api, isSignedIn, useSession } from "@/store/session";
import { toast } from "@/store/toast";

export function Composer() {
  const { user, openAuth } = useSession();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const signedIn = isSignedIn(user);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedIn) {
      openAuth();
      return;
    }
    setBusy(true);
    try {
      await api("/api/feed", { method: "POST", body: JSON.stringify({ body }) });
      setBody("");
      toast({ title: "Posted to Pulse", variant: "success" });
      router.refresh();
    } catch (err) {
      toast({ title: "Could not post", description: err instanceof Error ? err.message : undefined, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card flex gap-3 p-4">
      <Avatar name={user?.name ?? "?"} color="var(--brand)" size={36} />
      <div className="flex-1">
        <label htmlFor="composer" className="sr-only">
          Share a prediction
        </label>
        <textarea
          id="composer"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => !signedIn && openAuth()}
          rows={2}
          maxLength={500}
          placeholder={signedIn ? "What are you predicting?" : "Sign in to share a prediction…"}
          className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-brand"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-faint tabular">{body.length}/500</span>
          <Button type="submit" size="sm" loading={busy} disabled={signedIn && body.trim().length < 3}>
            {signedIn ? "Post" : "Sign in to post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
