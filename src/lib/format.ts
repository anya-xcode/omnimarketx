/** Formatting helpers shared by server and client components. */

export function formatCents(price: number) {
  const cents = price * 100;
  const rounded = Math.round(cents * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}¢`;
}

export function formatPct(price: number, digits = 0) {
  return `${(price * 100).toFixed(digits)}%`;
}

export function formatSignedPts(delta: number, digits = 1) {
  const pts = delta * 100;
  const sign = pts > 0 ? "+" : pts < 0 ? "-" : "";
  return `${sign}${Math.abs(pts).toFixed(digits)} pts`;
}

/**
 * Compact number formatting implemented by hand rather than Intl `notation: "compact"`:
 * ICU versions differ between Node and browsers (Node prints "$1.0M", Chrome "$1M"),
 * which caused hydration mismatches. This is deterministic everywhere.
 */
function compactNumber(n: number) {
  const abs = Math.abs(n);
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [size, suffix] of units) {
    if (abs >= size) {
      const v = abs / size;
      const s = (Math.round(v * 10) / 10).toString();
      return `${n < 0 ? "-" : ""}${s}${suffix}`;
    }
  }
  return `${n < 0 ? "-" : ""}${Math.round(abs)}`;
}

export function formatMoney(n: number, opts: { compact?: boolean; digits?: number } = {}) {
  const { compact = true, digits } = opts;
  if (compact && Math.abs(n) >= 1000) {
    const c = compactNumber(n);
    return c.startsWith("-") ? `-$${c.slice(1)}` : `$${c}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits ?? (Math.abs(n) < 100 ? 2 : 0),
  }).format(n);
}

export function formatSignedMoney(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${formatMoney(Math.abs(n), { compact: false, digits: 2 })}`;
}

export function formatCompact(n: number) {
  return compactNumber(n);
}

export function pluralize(n: number, singular: string, plural = `${singular}s`) {
  return `${formatCompact(n)} ${n === 1 ? singular : plural}`;
}

export function formatDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  // Market dates are defined in UTC ("23:59 UTC"); format in UTC so "31 December" never shows as "Jan 1" in eastern timezones.
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC", ...opts }).format(d);
}

export function timeUntil(iso: string | Date, now = new Date()) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const ms = d.getTime() - now.getTime();
  if (ms <= 0) return "Closed";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 60) return `${Math.round(days / 30)} months left`;
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} left`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours}h left`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m left`;
}

export function timeAgo(iso: string | Date, now = new Date()) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const s = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d, { year: undefined });
}
