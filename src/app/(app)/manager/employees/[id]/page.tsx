import { ArrowLeft, CalendarDays, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Role } from "@prisma/client";
import { DeleteEmployeeButton, RestoreEmployeeButton } from "@/components/remove-employee-button";
import { WeeklyPdfMenu } from "@/components/weekly-pdf-menu";
import { prisma } from "@/lib/prisma";
import { formatDuration, initials } from "@/lib/utils";
import { dateKey, mondayOf, weekLabel } from "@/lib/dates";

export default async function EmployeeHoursPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const employee=await prisma.user.findFirst({
    where:{id,role:Role.EMPLOYEE},
    include:{timesheets:{where:{entries:{some:{}}},include:{entries:{orderBy:[{date:"asc"},{createdAt:"asc"}]}},orderBy:{weekStart:"desc"}}},
  });
  if(!employee)notFound();
  const total=employee.timesheets.flatMap(timesheet=>timesheet.entries).reduce((sum,entry)=>sum+entry.minutes,0);

  return <>
    <Link href="/manager" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#52615d]"><ArrowLeft size={17}/>Employees</Link>
    <div className="mb-7 flex flex-wrap items-center gap-4"><span className="grid size-14 place-items-center rounded-full bg-[#d8efe9] text-base font-bold text-[#075f51]">{initials(employee.name)}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold">{employee.name}</h1>{!employee.active&&<span className="rounded-full bg-[#edf1ef] px-2.5 py-1 text-xs font-bold text-[#56635f]">Archived</span>}</div><p className="mt-1 text-sm font-semibold text-[#52615d]">{employee.employeeCode||employee.id} · {employee.jobTitle||employee.department||"Team member"}</p><p className="mt-1 flex items-center gap-2 text-sm text-[#66736f]"><Mail size={15}/>{employee.email}</p></div>{!employee.active&&<div className="grid w-full gap-2 sm:w-auto sm:min-w-[300px] sm:grid-cols-2"><RestoreEmployeeButton employeeId={employee.id} name={employee.name}/><DeleteEmployeeButton employeeId={employee.id} name={employee.name}/></div>}</div>
    <div className="mb-7 grid gap-4 sm:grid-cols-3"><Metric label="All tracked hours" value={formatDuration(total)}/><Metric label="Tracked weeks" value={String(employee.timesheets.length)}/><Metric label="Daily tracks" value={String(employee.timesheets.flatMap(timesheet=>timesheet.entries).length)}/></div>
    <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><CalendarDays size={20} className="text-[#087f6b]"/><h2 className="text-xl font-bold">Weekly history</h2></div><WeeklyPdfMenu currentWeekStart={dateKey(mondayOf(new Date()))} employeeId={employee.id} employeeName={employee.name}/></div>
    {employee.timesheets.length?<div className="space-y-4">{employee.timesheets.map(timesheet=>{const weekTotal=timesheet.entries.reduce((sum,entry)=>sum+entry.minutes,0);return <section key={timesheet.id} className="panel overflow-hidden"><div className="border-b bg-[#f8faf9] px-5 py-4"><h3 className="font-bold">{weekLabel(timesheet.weekStart)}</h3><p className="mt-1 text-sm text-[#66736f]">{formatDuration(weekTotal)} total</p></div><table className="w-full text-left"><thead><tr className="border-b text-xs font-bold uppercase text-[#65736f]"><th className="px-5 py-3">Day</th><th className="px-5 py-3 text-right">Tracked hours</th></tr></thead><tbody>{timesheet.entries.map(entry=><tr key={entry.id} className="border-b last:border-0"><td className="px-5 py-4 text-sm font-semibold">{format(entry.date,"EEEE, MMM d")}</td><td className="px-5 py-4 text-right font-bold">{formatDuration(entry.minutes)}</td></tr>)}</tbody></table></section>})}</div>:<div className="panel p-12 text-center text-[#66736f]">This employee has not tracked any hours yet.</div>}
  </>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="panel p-5"><div className="text-xs font-bold uppercase text-[#66736f]">{label}</div><div className="mt-2 text-2xl font-bold">{value}</div></div>}
