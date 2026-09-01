import { ArrowRight, CalendarClock, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { format, subWeeks } from "date-fns";
import { ensureTimesheet } from "@/actions/timesheets";
import { HoursChart } from "@/components/hours-chart";
import { requireSelectedEmployee } from "@/lib/selected-employee";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { mondayOf, weekLabel } from "@/lib/dates";

export const metadata={title:"Overview"};
export default async function DashboardPage() {
  const user=await requireSelectedEmployee(); const weekStart=mondayOf(new Date()); const current=await ensureTimesheet(weekStart,user.id);
  const timesheets=await prisma.timesheet.findMany({where:{userId:user.id,weekStart:{gte:subWeeks(weekStart,7),lte:weekStart},entries:{some:{}}},select:{id:true,weekStart:true,entries:{select:{date:true,minutes:true}}},orderBy:{weekStart:"desc"}});
  const currentFull=timesheets.find(t=>t.id===current.id)??{...current,entries:[]}; const currentMinutes=currentFull.entries.reduce((s,e)=>s+e.minutes,0);
  const trackedDays=new Set(timesheets.flatMap(t=>t.entries.map(e=>e.date.toISOString().slice(0,10)))).size; const chart=timesheets.slice().reverse().map(t=>({name:format(t.weekStart,"MMM d"),hours:Number((t.entries.reduce((s,e)=>s+e.minutes,0)/60).toFixed(1))}));
  return <><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#087f6b]">{format(new Date(),"EEEE, MMMM d")}</p><h1 className="mt-1 text-3xl font-bold">Good day, {user.name.split(" ")[0]}</h1><p className="mt-2 text-[#66736f]">Here&apos;s where your work week stands.</p></div><Link href={`/timesheets/${current.id}`} className="btn btn-primary"><Clock3 size={18}/>Log time</Link></div>
  <section className="grid gap-4 sm:grid-cols-3"><Metric icon={Clock3} label="This week" value={formatDuration(currentMinutes)} detail={`${Math.round((currentMinutes/(20*60))*100)}% of 20h`}/><Metric icon={CalendarDays} label="Current week" value={weekLabel(weekStart)} detail="Monday through Sunday"/><Metric icon={CalendarClock} label="Days tracked" value={String(trackedDays)} detail="Last 8 weeks"/></section>
  <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]"><div className="panel p-5"><div className="mb-5"><h2 className="font-bold">Weekly hours</h2><p className="mt-1 text-sm text-[#66736f]">Your recorded time across recent weeks</p></div><HoursChart data={chart}/></div><div className="panel"><div className="flex items-center justify-between border-b border-[#e3e8e6] p-5"><div><h2 className="font-bold">Recent weeks</h2><p className="mt-1 text-sm text-[#66736f]">Latest tracked hours</p></div><Link href="/timesheets" aria-label="View all weeks" title="View all weeks" className="text-[#087f6b]"><ArrowRight size={20}/></Link></div><div>{timesheets.slice(0,4).map(t=><Link href={`/timesheets/${t.id}`} key={t.id} className="flex items-center gap-3 border-b border-[#edf0ef] px-5 py-4 last:border-0 hover:bg-[#fafbfa]"><CalendarClock size={18} className="text-[#71807b]"/><div className="min-w-0 flex-1"><div className="text-sm font-bold">{weekLabel(t.weekStart)}</div><div className="mt-1 text-xs text-[#66736f]">{formatDuration(t.entries.reduce((s,e)=>s+e.minutes,0))}</div></div></Link>)}</div></div></section></>;
}
function Metric({icon:Icon,label,value,detail}:{icon:typeof Clock3;label:string;value:React.ReactNode;detail:string}) { return <div className="panel p-5"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-semibold text-[#66736f]">{label}</span><span className="grid size-9 place-items-center rounded-md bg-[#e8f4f1] text-[#087f6b]"><Icon size={18}/></span></div><div className="text-2xl font-bold">{value}</div><div className="mt-2 text-xs text-[#7a8783]">{detail}</div></div>; }
