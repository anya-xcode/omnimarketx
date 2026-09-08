"use client";

import { create } from "zustand";
import type { User } from "@/lib/types";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "same-origin",
  });
  const json = (await res.json().catch(() => ({ ok: false, error: "Network error" }))) as ApiResponse<T>;
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

interface SessionState {
  user: User | null;
  status: "idle" | "loading" | "ready" | "error";
  authOpen: boolean;
  load: () => Promise<void>;
  setUser: (u: User | null) => void;
  signIn: (name: string) => Promise<User>;
  toggleWatch: (slug: string) => Promise<void>;
  isWatched: (slug: string) => boolean;
  openAuth: () => void;
  closeAuth: () => void;
}

export const useSession = create<SessionState>((set, get) => ({
  user: null,
  status: "idle",
  authOpen: false,
  async load() {
    if (get().status === "loading") return;
    set({ status: "loading" });
    try {
      const user = await api<User>("/api/session");
      set({ user, status: "ready" });
    } catch {
      set({ status: "error" });
    }
  },
  setUser: (user) => set({ user }),
  async signIn(name) {
    const user = await api<User>("/api/session", { method: "PATCH", body: JSON.stringify({ name }) });
    set({ user, authOpen: false, status: "ready" });
    return user;
  },
  async toggleWatch(slug) {
    const { user } = get();
    if (!user) return;
    const has = user.watchlist.includes(slug);
    const optimistic = has ? user.watchlist.filter((s) => s !== slug) : [...user.watchlist, slug];
    set({ user: { ...user, watchlist: optimistic } });
    try {
      const watchlist = await api<string[]>("/api/watchlist", { method: "POST", body: JSON.stringify({ slug }) });
      set((s) => (s.user ? { user: { ...s.user, watchlist } } : {}));
    } catch {
      set((s) => (s.user ? { user: { ...s.user, watchlist: user.watchlist } } : {}));
    }
  },
  isWatched: (slug) => get().user?.watchlist.includes(slug) ?? false,
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
}));

/** A user counts as "signed in" for the demo once they have chosen a display name. */
export function isSignedIn(user: User | null) {
  return Boolean(user && !user.name.startsWith("Trader "));
}
