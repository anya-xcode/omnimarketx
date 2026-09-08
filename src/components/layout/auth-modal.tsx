"use client";

import { useState } from "react";
import { ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useSession } from "@/store/session";
import { toast } from "@/store/toast";

export function AuthModal() {
  const { authOpen, closeAuth, signIn } = useSession();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await signIn(name);
      toast({ title: `Welcome, ${u.name.split(" ")[0]}!`, description: "Your $10,000 demo balance is ready to trade.", variant: "success" });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={authOpen} onClose={closeAuth} title="Start trading in seconds">
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm text-muted">
          This is a demo environment. Pick a display name and you get a <strong className="text-text">$10,000 demo balance</strong> to trade
          every market. No email, password or wallet required.
        </p>
        <div>
          <label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold">
            Display name
          </label>
          <input
            id="auth-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Raman"
            autoComplete="nickname"
            maxLength={40}
            required
            className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors placeholder:text-faint focus:border-brand"
          />
          {error && (
            <p className="mt-1.5 text-xs font-medium text-no" role="alert">
              {error}
            </p>
          )}
        </div>
        <ul className="grid gap-2 text-xs text-muted sm:grid-cols-3">
          <li className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2"><Wallet className="size-3.5 text-brand" /> $10k demo funds</li>
          <li className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2"><Sparkles className="size-3.5 text-brand" /> Live price impact</li>
          <li className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2"><ShieldCheck className="size-3.5 text-brand" /> No real money</li>
        </ul>
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={name.trim().length < 2}>
          Continue
        </Button>
      </form>
    </Modal>
  );
}
