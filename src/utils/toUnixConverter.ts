// utils/toUnixConverter.ts

/**
 * Converts a date string (e.g. "2025-08-01") or Unix timestamp to a Unix timestamp (in seconds).
 * If the value is already a number, it returns it unchanged.
 * If null or undefined, it returns null.
 */
export function toUnixTimestamp(date: string | number | null | undefined): number | null {
  if (!date) return null;
  if (typeof date === 'number') return date;
  const parsed = Date.parse(date);
  return isNaN(parsed) ? null : Math.floor(parsed / 1000);
}
