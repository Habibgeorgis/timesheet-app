"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, isAfter, isBefore, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { dateKey, mondayOf } from "@/lib/dates";

export function WeeklyPdfMenu({ currentTimesheetId, currentWeekStart }: { currentTimesheetId: string; currentWeekStart: string }) {
  const currentMonday = mondayOf(currentWeekStart);
  const latestPreviousMonday = addDays(currentMonday, -7);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(latestPreviousMonday));
  const [selectedMonday, setSelectedMonday] = useState(latestPreviousMonday);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const calendarStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
  const calendarEnd = addDays(startOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 }), 6);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const selectedFriday = addDays(selectedMonday, 4);
  const selectedLabel = `${format(selectedMonday, "MMM d")} - ${format(selectedFriday, "MMM d, yyyy")}`;
  const canMoveForward = isBefore(endOfMonth(visibleMonth), startOfMonth(currentMonday));

  function chooseWeek(day: Date) {
    const monday = mondayOf(day);
    if (isAfter(monday, latestPreviousMonday)) return;
    setSelectedMonday(monday);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button className="btn btn-secondary" type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <FileText size={18} />Weekly PDF
      </button>
      {open && (
        <div className="panel absolute right-0 z-20 mt-2 w-[min(380px,calc(100vw-32px))] p-5 shadow-xl" role="dialog" aria-label="Download weekly tracking">
          <h2 className="font-bold">Download weekly tracking</h2>
          <a className="btn btn-primary mt-4 w-full" href={`/api/reports/timesheets/${currentTimesheetId}`} onClick={() => setOpen(false)}>
            <Download size={17} />Download this week&apos;s tracking
          </a>
          <div className="my-5 border-t border-[#dce3e0]" />
          <div className="flex items-center gap-2 font-bold"><CalendarDays size={17} className="text-[#087f6b]" />Select a previous week</div>

          <div className="mt-4 overflow-hidden rounded-md border border-[#dce3e0]">
            <div className="flex items-center justify-between border-b border-[#e4e9e7] px-2 py-2">
              <button type="button" className="grid size-9 place-items-center rounded hover:bg-[#eef4f2]" aria-label="Previous month" onClick={() => setVisibleMonth((month) => addMonths(month, -1))}>
                <ChevronLeft size={18} />
              </button>
              <div className="font-bold" aria-live="polite">{format(visibleMonth, "MMMM yyyy")}</div>
              <button type="button" className="grid size-9 place-items-center rounded hover:bg-[#eef4f2] disabled:cursor-not-allowed disabled:opacity-30" aria-label="Next month" disabled={!canMoveForward} onClick={() => setVisibleMonth((month) => addMonths(month, 1))}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 px-2 pt-2 text-center text-[11px] font-bold uppercase text-[#66736f]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span className="py-1" key={day}>{day}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1 px-2 pb-3">
              {days.map((day) => {
                const dayMonday = mondayOf(day);
                const unavailable = isAfter(dayMonday, latestPreviousMonday);
                const weekday = day.getDay();
                const selected = dateKey(dayMonday) === dateKey(selectedMonday) && weekday >= 1 && weekday <= 5;
                return (
                  <button
                    type="button"
                    key={dateKey(day)}
                    disabled={unavailable}
                    onClick={() => chooseWeek(day)}
                    aria-label={`Select week containing ${format(day, "MMMM d, yyyy")}`}
                    className={`h-9 text-sm transition-colors ${selected ? "bg-[#087f6b] font-bold text-white" : "hover:bg-[#e7f2ef]"} ${!isSameMonth(day, visibleMonth) ? "text-[#a7b0ad]" : ""} ${unavailable ? "cursor-not-allowed opacity-30" : ""} ${selected && isSameDay(day, selectedMonday) ? "rounded-l-md" : ""} ${selected && isSameDay(day, selectedFriday) ? "rounded-r-md" : ""}`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 rounded-md bg-[#f2f7f5] px-3 py-2 text-sm">
            <span className="text-[#66736f]">Selected work week</span>
            <strong className="mt-1 block">{selectedLabel}</strong>
          </div>
          <a className="btn btn-secondary mt-3 w-full" href={`/api/reports/weekly?week=${dateKey(selectedMonday)}`} onClick={() => setOpen(false)}>
            <Download size={17} />Download selected week
          </a>
        </div>
      )}
    </div>
  );
}
