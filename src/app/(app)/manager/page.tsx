import { CalendarDays, Clock3, Download, Users } from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";
import { subWeeks } from "date-fns";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { mondayOf, weekLabel } from "@/lib/dates";

export const metadata={title:"Team hours"};

export default async function ManagerPage(){
  await requireRole([Role.MANAGER,Role.ADMIN]);
  const since=subWeeks(mondayOf(new Date()),11);
  const [rows,employees]=await Promise.all([
    prisma.timesheet.findMany({where:{user:{role:"EMPLOYEE",active:true},weekStart:{gte:since},entries:{some:{}}},include:{user:true,entries:true},orderBy:[{weekStart:"desc"},{user:{name:"asc"}}]}),
    prisma.user.count({where:{role:"EMPLOYEE",active:true}}),
  ]);
  const total=rows.flatMap(row=>row.entries).reduce((sum,entry)=>sum+entry.minutes,0);
  const trackedEmployees=new Set(rows.filter(row=>row.entries.length).map(row=>row.userId)).size;

  return <>
    <div className="mb-7"><h1 className="text-3xl font-bold">Team hours</h1><p className="mt-2 text-[#66736f]">Employee hours by Monday–Friday work week.</p></div>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Metric icon={Clock3} label="Total hours" value={formatDuration(total)}/><Metric icon={Users} label="Active employees" value={String(employees)}/><Metric icon={CalendarDays} label="Employees tracking" value={String(trackedEmployees)}/></div>
    <div className="panel overflow-hidden">
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b bg-[#f8faf9] px-5 py-3 text-xs font-bold uppercase text-[#65736f] md:grid-cols-[1fr_1fr_.5fr_112px]"><span>Employee</span><span className="desktop-only">Week</span><span className="desktop-only">Hours</span><span>Weekly PDF</span></div>
      {rows.length?rows.map(row=>{const minutes=row.entries.reduce((sum,entry)=>sum+entry.minutes,0);return <div key={row.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b px-5 py-4 last:border-0 md:grid-cols-[1fr_1fr_.5fr_112px]"><Link href={`/manager/timesheets/${row.id}`} className="min-w-0"><span className="block truncate font-bold">{row.user.name}</span><span className="mt-1 block text-xs text-[#66736f] md:hidden">{weekLabel(row.weekStart)} · {formatDuration(minutes)}</span></Link><Link href={`/manager/timesheets/${row.id}`} className="desktop-only text-sm font-semibold">{weekLabel(row.weekStart)}</Link><span className="desktop-only text-sm font-bold">{formatDuration(minutes)}</span><a className="btn btn-secondary min-w-[92px]" href={`/api/reports/timesheets/${row.id}`} aria-label={`Download ${row.user.name}'s report for ${weekLabel(row.weekStart)}`}><Download size={17}/>PDF</a></div>}):<div className="p-12 text-center text-[#66736f]">No employee hours have been tracked yet.</div>}
    </div>
  </>;
}

function Metric({icon:Icon,label,value}:{icon:typeof Clock3;label:string;value:string}){return <div className="panel flex items-center gap-4 p-5"><span className="grid size-10 place-items-center rounded-md bg-[#e8f4f1] text-[#087f6b]"><Icon size={19}/></span><div><div className="text-2xl font-bold">{value}</div><div className="text-xs font-semibold text-[#66736f]">{label}</div></div></div>}
