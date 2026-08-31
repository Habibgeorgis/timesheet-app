import { addDays, endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from "date-fns";

export function mondayOf(value: Date | string) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function weekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function weekLabel(weekStart: Date) {
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });
  return `${format(weekStart, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

export function isDateInWeek(date: Date, weekStart: Date) {
  return isWithinInterval(date, { start: mondayOf(weekStart), end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
}

