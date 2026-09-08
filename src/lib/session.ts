import "server-only";
import { cookies } from "next/headers";
import { uid } from "./utils";

export const SESSION_COOKIE = "omx_uid";

/** Read the anonymous demo-session id, if the visitor has one. Safe to call from server components. */
export async function getSessionId(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

/** Get or create the demo-session id. Only call from route handlers / server actions (sets a cookie). */
export async function ensureSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const id = uid("u");
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
