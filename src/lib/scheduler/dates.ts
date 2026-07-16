import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

/**
 * Date / money / percentage helpers for the scheduler.
 *
 * NOTE: `cn` lives in `@/lib/utils` — do not redefine it here.
 */

/**
 * A fixed "today" anchor so the seeded schedule is deterministic between server
 * and client renders (no hydration drift) while still reading as the current
 * week.
 */
export const TODAY = "2026-07-15";

export function toDate(iso: string): Date {
  const d = parseISO(iso);
  return isValid(d) ? d : new Date(TODAY);
}

export function fmtDate(iso: string, pattern = "MMM d") {
  return format(toDate(iso), pattern);
}

export function fmtRange(startIso: string, endIso: string) {
  const s = toDate(startIso);
  const e = toDate(endIso);
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) return `${format(s, "MMM d")}–${format(e, "d")}`;
  return `${format(s, "MMM d")} – ${format(e, "MMM d")}`;
}

export function durationDays(startIso: string, endIso: string) {
  return Math.max(
    1,
    differenceInCalendarDays(toDate(endIso), toDate(startIso)) + 1
  );
}

export function daysBetween(aIso: string, bIso: string) {
  return differenceInCalendarDays(toDate(bIso), toDate(aIso));
}

export function fmtMoney(n?: number, opts?: { compact?: boolean }) {
  if (n === undefined || n === null) return "—";
  if (opts?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
