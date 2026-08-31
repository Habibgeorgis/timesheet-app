import { CalendarDays, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { weekLabel } from "@/lib/dates";
export const metadata={title:"My tracking"};
export default async function TimesheetsPage() {
  const user=await requireUser();
  const rows=await prisma.timesheet.findMany({where:{userId:user.id},include:{entries:true},orderBy:{weekStart:"desc"}});
  const totalMinutes=rows.flatMap((row)=>row.entries).reduce((sum,entry)=>sum+entry.minutes,0);
  const approved=rows.filter((row)=>row.status==="APPROVED").length;

  return <>
    <div className="mb-7"><h1 className="text-3xl font-bold">My tracking</h1><p className="mt-2 text-[#66736f]">Review weekly hours, approval history, and downloadable reports.</p></div>
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <Metric label="Total tracked" value={formatDuration(totalMinutes)}/>
      <Metric label="Timesheets" value={String(rows.length)}/>
      <Metric label="Approved" value={String(approved)}/>
    </div>
    <div className="panel overflow-hidden">
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-[#f8faf9] px-5 py-3 text-xs font-bold uppercase text-[#65736f] md:grid-cols-[1.4fr_.5fr_.6fr_112px]"><span>Week</span><span className="desktop-only">Hours</span><span className="desktop-only">Status</span><span>Report</span></div>
      {rows.length?rows.map((row)=>{
        const minutes=row.entries.reduce((sum,entry)=>sum+entry.minutes,0);
        return <div key={row.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b px-5 py-4 last:border-0 hover:bg-[#fafbfa] md:grid-cols-[1.4fr_.5fr_.6fr_112px]">
          <Link href={`/timesheets/${row.id}`} className="flex min-w-0 items-center gap-3 font-semibold"><CalendarDays size={18} className="shrink-0 text-[#72807c]"/><span><span className="block">{weekLabel(row.weekStart)}</span><span className="mt-1 flex items-center gap-2 text-xs font-normal text-[#66736f] md:hidden">{formatDuration(minutes)} <StatusBadge status={row.status}/></span></span><ChevronRight className="desktop-only ml-auto text-[#87938f]" size={18}/></Link>
          <span className="desktop-only text-sm font-bold">{formatDuration(minutes)}</span>
          <span className="desktop-only"><StatusBadge status={row.status}/></span>
          <a className="btn btn-secondary min-w-[92px]" href={`/api/reports/timesheets/${row.id}`} aria-label={`Download PDF for ${weekLabel(row.weekStart)}`}><Download size={17}/>PDF</a>
        </div>;
      }):<div className="p-10 text-center text-[#66736f]">No timesheets yet.</div>}
    </div>
  </>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="panel px-5 py-4"><div className="text-xs font-bold uppercase text-[#66736f]">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>}
