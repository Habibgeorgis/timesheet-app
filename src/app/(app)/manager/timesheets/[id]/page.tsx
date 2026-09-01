import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { dateKey, weekDays, weekLabel } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";

export default async function TeamWeekPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const row=await prisma.timesheet.findFirst({where:{id,user:{role:"EMPLOYEE"}},include:{user:true,entries:{orderBy:{date:"asc"}}}});
  if(!row)notFound();
  const daily=weekDays(row.weekStart).map(day=>({day,minutes:row.entries.filter(entry=>dateKey(entry.date)===dateKey(day)).reduce((sum,entry)=>sum+entry.minutes,0)}));
  const total=daily.reduce((sum,item)=>sum+item.minutes,0);
  return <><Link href="/manager" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#52615d]"><ArrowLeft size={17}/>Team timesheets</Link><div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">{row.user.name}</h1><p className="mt-1 text-sm font-semibold text-[#52615d]">{row.user.employeeCode||row.user.id} · {row.user.jobTitle||row.user.department||"Team member"}</p><p className="mt-2 text-[#66736f]">{weekLabel(row.weekStart)} · {formatDuration(total)}</p></div><a href={`/api/reports/timesheets/${id}`} className="btn btn-secondary"><Download size={18}/>Weekly PDF</a></div><div className="panel overflow-hidden"><table className="w-full text-left"><thead><tr className="border-b bg-[#f8faf9] text-xs uppercase text-[#65736f]"><th className="px-5 py-3">Day</th><th className="px-5 py-3 text-right">Tracked hours</th></tr></thead><tbody>{daily.map(item=><tr key={dateKey(item.day)} className="border-b last:border-0"><td className="px-5 py-4 text-sm font-semibold">{format(item.day,"EEEE, MMM d")}</td><td className="px-5 py-4 text-right font-bold">{formatDuration(item.minutes)}</td></tr>)}</tbody><tfoot><tr className="border-t-2 bg-[#fafbfa]"><td className="px-5 py-4 text-right text-sm font-bold">Weekly total</td><td className="px-5 py-4 text-right text-lg font-bold text-[#087f6b]">{formatDuration(total)}</td></tr></tfoot></table></div></>;
}
