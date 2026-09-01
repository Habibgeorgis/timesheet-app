import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ensureTimesheet } from "@/actions/timesheets";
import { WeeklyPdfMenu } from "@/components/weekly-pdf-menu";
import { requireSelectedEmployee } from "@/lib/selected-employee";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { dateKey, mondayOf, weekLabel } from "@/lib/dates";
export const metadata={title:"My tracking"};
export default async function TimesheetsPage() {
  const user=await requireSelectedEmployee();
  const currentWeek=mondayOf(new Date());
  const current=await ensureTimesheet(currentWeek,user.id);
  const rows=await prisma.timesheet.findMany({where:{userId:user.id,weekStart:{lte:currentWeek}},include:{entries:true},orderBy:{weekStart:"desc"}});
  const totalMinutes=rows.flatMap((row)=>row.entries).reduce((sum,entry)=>sum+entry.minutes,0);

  return <>
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">My tracking</h1><p className="mt-2 text-[#66736f]">Record and review hours by work week.</p></div><WeeklyPdfMenu currentTimesheetId={current.id} currentWeekStart={dateKey(currentWeek)}/></div>
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <Metric label="Total tracked" value={formatDuration(totalMinutes)}/>
      <Metric label="Tracked weeks" value={String(rows.length)}/>
      <Metric label="Average per week" value={formatDuration(rows.length?Math.round(totalMinutes/rows.length):0)}/>
    </div>
    <div className="panel overflow-hidden">
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-[#f8faf9] px-5 py-3 text-xs font-bold uppercase text-[#65736f] md:grid-cols-[1.4fr_.6fr]"><span>Week</span><span>Hours</span></div>
      {rows.length?rows.map((row)=>{
        const minutes=row.entries.reduce((sum,entry)=>sum+entry.minutes,0);
        return <Link href={`/timesheets/${row.id}`} key={row.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b px-5 py-4 last:border-0 hover:bg-[#fafbfa] md:grid-cols-[1.4fr_.6fr]">
          <span className="flex min-w-0 items-center gap-3 font-semibold"><CalendarDays size={18} className="shrink-0 text-[#72807c]"/><span><span className="block">{weekLabel(row.weekStart)}</span><span className="mt-1 block text-xs font-normal text-[#66736f] md:hidden">{formatDuration(minutes)}</span></span><ChevronRight className="desktop-only ml-auto text-[#87938f]" size={18}/></span>
          <span className="text-sm font-bold">{formatDuration(minutes)}</span>
        </Link>;
      }):<div className="p-10 text-center text-[#66736f]">No timesheets yet.</div>}
    </div>
  </>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="panel px-5 py-4"><div className="text-xs font-bold uppercase text-[#66736f]">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>}
