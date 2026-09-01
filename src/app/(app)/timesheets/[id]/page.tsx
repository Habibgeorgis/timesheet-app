import { ArrowLeft, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addDays, format } from "date-fns";
import { deleteEntry } from "@/actions/timesheets";
import { EditEntryButton } from "@/components/edit-entry-button";
import { EntryForm } from "@/components/entry-form";
import { dateKey, mondayOf, weekLabel } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireSelectedEmployee } from "@/lib/selected-employee";
import { formatDuration } from "@/lib/utils";

export default async function TimesheetDetail({params}:{params:Promise<{id:string}>}) {
  const employee=await requireSelectedEmployee();
  const {id}=await params;
  const timesheet=await prisma.timesheet.findFirst({where:{id,userId:employee.id},include:{entries:{orderBy:[{date:"asc"},{createdAt:"asc"}]}}});
  if(!timesheet)notFound();
  const currentWeek=mondayOf(new Date());
  if(dateKey(timesheet.weekStart)>dateKey(currentWeek))redirect("/timesheet");
  const total=timesheet.entries.reduce((sum,entry)=>sum+entry.minutes,0);
  const previous=dateKey(addDays(timesheet.weekStart,-7));
  const next=dateKey(addDays(timesheet.weekStart,7));
  const isCurrentWeek=dateKey(timesheet.weekStart)===dateKey(currentWeek);
  return <>
    <Link href="/timesheets" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#52615d]"><ArrowLeft size={17}/>All weeks</Link>
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">{weekLabel(timesheet.weekStart)}</h1><p className="mt-2 text-[#66736f]">{formatDuration(total)} weekly total</p></div><div className="flex flex-wrap gap-2"><Link href={`/timesheet?week=${previous}`} className="btn btn-secondary" title="Previous week"><ChevronLeft size={18}/></Link><Link href="/timesheet" className="btn btn-secondary">Current week</Link>{isCurrentWeek?<button type="button" className="btn btn-secondary cursor-not-allowed opacity-40" title="Current week reached" aria-label="Next week unavailable" disabled><ChevronRight size={18}/></button>:<Link href={`/timesheet?week=${next}`} className="btn btn-secondary" title="Next week"><ChevronRight size={18}/></Link>}<a href={`/api/reports/timesheets/${id}`} className="btn btn-secondary"><Download size={18}/>Weekly PDF</a></div></div>
    <div className="mb-6"><EntryForm timesheetId={id} defaultDate={dateKey(timesheet.weekStart)}/></div>
    <div className="panel overflow-hidden"><table className="w-full border-collapse text-left"><thead><tr className="border-b bg-[#f8faf9] text-xs uppercase text-[#65736f]"><th className="px-5 py-3">Tracked entry</th><th className="px-5 py-3 text-right">Hours</th><th className="w-24"/></tr></thead><tbody>{timesheet.entries.map(entry=><tr key={entry.id} className="border-b last:border-0"><td className="whitespace-nowrap px-5 py-4 text-sm font-semibold">{format(entry.date,"EEEE, MMM d")}</td><td className="px-5 py-4 text-right font-bold">{formatDuration(entry.minutes)}</td><td><div className="flex"><EditEntryButton entryId={entry.id} timesheetId={id} date={dateKey(entry.date)} minutes={entry.minutes}/><form action={deleteEntry}><input type="hidden" name="entryId" value={entry.id}/><button title="Delete entry" aria-label="Delete entry" className="grid size-9 place-items-center text-[#a53b34] hover:bg-red-50"><Trash2 size={17}/></button></form></div></td></tr>)}{!timesheet.entries.length&&<tr><td colSpan={3} className="px-5 py-12 text-center text-[#66736f]">No time recorded for this week.</td></tr>}</tbody><tfoot><tr className="border-t-2 bg-[#fafbfa]"><td className="px-5 py-4 text-right text-sm font-bold">Weekly total</td><td className="px-5 py-4 text-right text-lg font-bold text-[#087f6b]">{formatDuration(total)}</td><td/></tr></tfoot></table></div>
  </>;
}
