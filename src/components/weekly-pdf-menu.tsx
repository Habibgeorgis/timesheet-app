"use client";

import { useState } from "react";
import { CalendarDays, Download, FileText } from "lucide-react";

type WeekOption={id:string;value:string;label:string};

export function WeeklyPdfMenu({currentTimesheetId,previousWeeks}:{currentTimesheetId:string;previousWeeks:WeekOption[]}){
  const [selectedWeek,setSelectedWeek]=useState(previousWeeks[0]?.value??"");
  const selected=previousWeeks.find(week=>week.value===selectedWeek);
  return <details className="relative">
    <summary className="btn btn-secondary list-none"><FileText size={18}/>Weekly PDF</summary>
    <div className="panel absolute right-0 z-20 mt-2 w-[min(360px,calc(100vw-32px))] p-5 shadow-xl">
      <h2 className="font-bold">Download weekly tracking</h2>
      <a className="btn btn-primary mt-4 w-full" href={`/api/reports/timesheets/${currentTimesheetId}`}><Download size={17}/>Download this week&apos;s tracking</a>
      <div className="my-5 border-t border-[#dce3e0]"/>
      <div className="flex items-center gap-2 font-bold"><CalendarDays size={17} className="text-[#087f6b]"/>Select a previous week</div>
      <label className="label mt-4" htmlFor="pdf-week">Calendar week</label>
      <input id="pdf-week" type="week" className="input" value={selectedWeek} max={previousWeeks[0]?.value} disabled={!previousWeeks.length} onChange={event=>setSelectedWeek(event.target.value)}/>
      {selected?<a className="btn btn-secondary mt-3 w-full" href={`/api/reports/timesheets/${selected.id}`}><Download size={17}/>Download selected week</a>:<button type="button" disabled className="btn btn-secondary mt-3 w-full opacity-60"><Download size={17}/>No tracking for this week</button>}
    </div>
  </details>;
}
