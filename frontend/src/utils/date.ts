import { formatDistanceToNow as fnsFormatDistanceToNow, format as fnsFormat } from 'date-fns';

/**
 * Parses any date string from the backend into a valid JavaScript Date.
 * Ensures naive UTC timestamps (without 'Z' or timezone offset) are correctly
 * treated as UTC, preventing timezone mismatch bugs (e.g. 5h30m IST offset).
 */
export function parseUTCDate(dateInput: string | Date | number | null | undefined): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'number') return new Date(dateInput);

  let str = String(dateInput).trim();
  // Normalize SQLite format (space to 'T')
  str = str.replace(' ', 'T');

  // If string does not have timezone designator (Z or +00:00 or -05:00), append 'Z'
  if (!str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str += 'Z';
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Formats relative time for posts (e.g., "just now", "5m ago", "2h ago", "3d ago").
 */
export function getTimeAgo(dateInput: string | Date | number | null | undefined): string {
  const date = parseUTCDate(dateInput);
  const diff = Date.now() - date.getTime();

  // If clock skew or future timestamp, return 'just now'
  if (diff < 0) return 'just now';

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/**
 * Formats compact relative time for comments (e.g., "now", "5m", "2h", "3d").
 */
export function getCommentTimeAgo(dateInput: string | Date | number | null | undefined): string {
  const date = parseUTCDate(dateInput);
  const diff = Date.now() - date.getTime();

  if (diff < 0) return 'now';

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  return `${years}y`;
}

/**
 * Safe wrapper around date-fns formatDistanceToNow that guarantees UTC parsing.
 */
export function safeFormatDistanceToNow(
  dateInput: string | Date | number | null | undefined,
  options?: Parameters<typeof fnsFormatDistanceToNow>[1]
): string {
  const date = parseUTCDate(dateInput);
  return fnsFormatDistanceToNow(date, options);
}

/**
 * Formats a date into a localized string (e.g. "Aug 8, 2026").
 */
export function formatDate(dateInput: string | Date | number | null | undefined, formatStr = 'MMM d, yyyy'): string {
  const date = parseUTCDate(dateInput);
  return fnsFormat(date, formatStr);
}
