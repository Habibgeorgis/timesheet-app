import { addDays, endOfDay, format, isValid, isWithinInterval, parse, parseISO, startOfWeek } from "date-fns";

export function mondayOf(value: Date | string) {
  const date = typeof value === "string" ? parseISO(value) : value;
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate(), 12));
}

export function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function weekDays(weekStart: Date) {
  return Array.from({ length: 5 }, (_, index) => addDays(mondayOf(weekStart), index));
}

export function weekLabel(weekStart: Date) {
  const start = mondayOf(weekStart);
  const end = addDays(start, 4);
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

export function isDateInWeek(date: Date, weekStart: Date) {
  const start = mondayOf(weekStart);
  return isWithinInterval(date, { start, end: endOfDay(addDays(start, 4)) });
}

export function weekInputValue(date: Date) {
  return format(mondayOf(date), "RRRR-'W'II");
}

export function weekFromInput(value: string) {
  if (!/^\d{4}-W\d{2}$/.test(value)) return null;
  const parsed = parse(value, "RRRR-'W'II", new Date());
  return isValid(parsed) ? mondayOf(parsed) : null;
}
