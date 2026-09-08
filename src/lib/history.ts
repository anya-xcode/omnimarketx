import { seededRandom, hashString, clamp } from "./utils";
import type { Outcome, PricePoint } from "./types";

/**
 * Generates a deterministic random-walk price history that ends exactly at the
 * market's current outcome prices. Daily points for `days`, then hourly for the last day.
 */
export function generateHistory(slug: string, outcomes: Outcome[], days = 90, now = Date.now()): PricePoint[] {
  const rand = seededRandom(hashString(slug));
  const ids = outcomes.map((o) => o.id);
  const finals = Object.fromEntries(outcomes.map((o) => [o.id, o.price]));
  const points = days + 24;
  const times: number[] = [];
  for (let d = days; d >= 1; d--) times.push(now - d * 86_400_000);
  for (let h = 23; h >= 0; h--) times.push(now - h * 3_600_000);

  // Walk backwards from the final price so the series lands exactly on today's price.
  const series: Record<string, number[]> = {};
  for (const id of ids) {
    const arr = new Array<number>(points);
    let p = finals[id];
    arr[points - 1] = p;
    const vol = 0.012 + rand() * 0.02;
    for (let i = points - 2; i >= 0; i--) {
      const hourly = i >= days;
      const step = (rand() - 0.5) * vol * (hourly ? 0.35 : 1);
      const revert = (0.5 - p) * 0.01;
      p = clamp(p - step - revert, 0.02, 0.98);
      arr[i] = p;
    }
    series[id] = arr;
  }

  const out: PricePoint[] = [];
  for (let i = 0; i < points; i++) {
    const row: Record<string, number> = {};
    let sum = 0;
    for (const id of ids) sum += series[id][i];
    for (const id of ids) row[id] = i === points - 1 ? finals[id] : Number((series[id][i] / sum).toFixed(4));
    out.push({ t: times[i], p: row });
  }
  return out;
}
