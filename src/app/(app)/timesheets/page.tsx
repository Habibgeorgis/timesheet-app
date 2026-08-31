import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { weekLabel } from "@/lib/dates";
export const metadata={title:"My timesheets"};
export default async function TimesheetsPage() { const user=await requireUser(); const rows=await prisma.timesheet.findMany({where:{userId:user.id},include:{entries:true},orderBy:{weekStart:"desc"}}); return <><div className="mb-7"><h1 className="text-3xl font-bold">My timesheets</h1><p className="mt-2 text-[#66736f]">Review weekly records and approval history.</p></div><div className="panel overflow-hidden"><div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b bg-[#f8faf9] px-5 py-3 text-xs font-bold uppercase text-[#65736f] md:grid-cols-[1.4fr_.6fr_.6fr_32px]"><span>Week</span><span>Hours</span><span>Status</span><span className="desktop-only"/></div>{rows.length?rows.map(row=><Link href={`/timesheets/${row.id}`} key={row.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-5 py-4 last:border-0 hover:bg-[#fafbfa] md:grid-cols-[1.4fr_.6fr_.6fr_32px]"><span className="flex items-center gap-3 font-semibold"><CalendarDays size={18} className="text-[#72807c]"/>{weekLabel(row.weekStart)}</span><span className="text-sm font-bold">{formatDuration(row.entries.reduce((s,e)=>s+e.minutes,0))}</span><StatusBadge status={row.status}/><ChevronRight className="desktop-only text-[#87938f]" size={18}/></Link>):<div className="p-10 text-center text-[#66736f]">No timesheets yet.</div>}</div></>; }
