/** YYYY-MM-DD in the local day. toISOString hands back UTC, which after ten
 *  at night in Cairo is already tomorrow. */
export function localDate(d: Date): string {
  const copy = new Date(d);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

/** The first and last days of this month and the one before, as YYYY-MM-DD. */
export function monthBounds(now: Date): {
  today: string;
  monthStart: string;
  monthEnd: string;
  prevStart: string;
  prevEnd: string;
} {
  const y = now.getFullYear();
  const m = now.getMonth();
  return {
    today: localDate(now),
    monthStart: localDate(new Date(y, m, 1)),
    monthEnd: localDate(new Date(y, m + 1, 0)),
    prevStart: localDate(new Date(y, m - 1, 1)),
    prevEnd: localDate(new Date(y, m, 0)),
  };
}

/**
 * Growth from one month to the next, as a percentage rounded to one place --
 * the database's month_over_month, so a figure counted here and one counted
 * there move the same way. A month with nothing before it is 0, not infinite.
 */
export function monthOverMonth(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
