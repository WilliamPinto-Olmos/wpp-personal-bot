import { DateTime } from "luxon";

/**
 * Formats a date as a relative time string in Spanish.
 * Examples: "hace 5 min", "hace 2 h", "ayer", "hace 3 días"
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = DateTime.now().setZone("America/Mexico_City");
  const then = DateTime.fromJSDate(date).setZone("America/Mexico_City");
  const diff = now.diff(then, ["days", "hours", "minutes"]);

  if (diff.days >= 1) {
    const days = Math.floor(diff.days);
    if (days === 1) return "ayer";
    if (days < 7) return `hace ${days} días`;
    return then.toFormat("dd/MM");
  }

  if (diff.hours >= 1) {
    const hours = Math.floor(diff.hours);
    return `hace ${hours} h`;
  }

  const minutes = Math.floor(diff.minutes);
  if (minutes < 1) return "ahora";
  return `hace ${minutes} min`;
}
