import { NextResponse } from "next/server";
import { RepoError } from "./repo";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** Wrap a route handler so repo/validation errors become clean JSON responses. */
export function handle<T extends unknown[]>(fn: (...args: T) => Promise<Response>) {
  return async (...args: T): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof RepoError) return fail(err.message, err.status);
      console.error(err);
      return fail("Something went wrong. Please try again.", 500);
    }
  };
}
