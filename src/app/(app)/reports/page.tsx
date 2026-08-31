import { Download, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { weekLabel } from "@/lib/dates";
import { StatusBadge } from "@/components/ui/status-badge";
export const metadata={title:"Reports"};
export default async function ReportsPage(){const user=await requireUser();const rows=await prisma.timesheet.findMany({where:{userId:user.id},include:{entries:true},orderBy:{weekStart:"desc"}});return <><div className="mb-7"><h1 className="text-3xl font-bold">Reports</h1><p className="mt-2 text-[#66736f]">Download signed weekly records for payroll or compliance.</p></div><div className="panel"><div className="border-b p-5"><h2 className="font-bold">Weekly timesheet reports</h2></div>{rows.map(row=><div key={row.id} className="flex flex-wrap items-center gap-4 border-b px-5 py-4 last:border-0"><span className="grid size-10 place-items-center rounded-md bg-[#edf5f2] text-[#087f6b]"><FileText size={19}/></span><div className="min-w-[200px] flex-1"><div className="font-semibold">{weekLabel(row.weekStart)}</div><div className="mt-1 text-xs text-[#66736f]">{formatDuration(row.entries.reduce((s,e)=>s+e.minutes,0))}</div></div><StatusBadge status={row.status}/><a className="btn btn-secondary" href={`/api/reports/timesheets/${row.id}`}><Download size={17}/>PDF</a></div>)}</div></>}
