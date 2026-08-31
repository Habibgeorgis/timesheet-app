import { Archive, CalendarDays, ChevronRight, Clock3, Mail } from "lucide-react";
import Link from "next/link";
import { Prisma, Role } from "@prisma/client";
import { AddEmployeeForm } from "@/components/add-employee-form";
import { RemoveEmployeeButton, RestoreEmployeeButton } from "@/components/remove-employee-button";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration, initials } from "@/lib/utils";

type EmployeeProfile=Prisma.UserGetPayload<{include:{timesheets:{include:{entries:true}}}}>;

export const metadata={title:"Employees"};

export default async function ManagerPage(){
  await requireRole([Role.MANAGER,Role.ADMIN]);
  const employees=await prisma.user.findMany({
    where:{role:Role.EMPLOYEE},
    include:{timesheets:{include:{entries:true},orderBy:{weekStart:"desc"}}},
    orderBy:{name:"asc"},
  });
  const active=employees.filter(employee=>employee.active);
  const archived=employees.filter(employee=>!employee.active);

  return <>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Employees</h1><p className="mt-2 text-[#66736f]">Select a profile to review all weekly and daily hours.</p></div><AddEmployeeForm/></div>
    <section aria-labelledby="active-employees"><div className="mb-4 flex items-center gap-2"><h2 id="active-employees" className="text-lg font-bold">Active employees</h2><span className="rounded-full bg-[#e8f4f1] px-2 py-0.5 text-xs font-bold text-[#087f6b]">{active.length}</span></div>
      {active.length?<EmployeeGrid>{active.map(employee=><EmployeeCard key={employee.id} employee={employee}/>)}</EmployeeGrid>:<EmptyState title="No active employees" text="Add an employee or restore one from the archive."/>}
    </section>
    <section className="mt-10 border-t border-[#dce3e0] pt-8" aria-labelledby="archived-employees"><div className="mb-4 flex items-center gap-2"><Archive size={19} className="text-[#66736f]"/><h2 id="archived-employees" className="text-lg font-bold">Archived employees</h2><span className="rounded-full bg-[#edf1ef] px-2 py-0.5 text-xs font-bold text-[#56635f]">{archived.length}</span></div>
      <p className="mb-5 text-sm text-[#66736f]">Historical hours and weekly PDFs remain available after removal.</p>
      {archived.length?<EmployeeGrid>{archived.map(employee=><EmployeeCard key={employee.id} employee={employee} archived/>)}</EmployeeGrid>:<EmptyState title="Archive is empty" text="Removed employees will appear here with their tracked hours preserved."/>}
    </section>
  </>;
}

function EmployeeGrid({children}:{children:React.ReactNode}){return <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,320px))]">{children}</div>}

function EmployeeCard({employee,archived=false}:{employee:EmployeeProfile;archived?:boolean}){
  const entries=employee.timesheets.flatMap(timesheet=>timesheet.entries);
  const total=entries.reduce((sum,entry)=>sum+entry.minutes,0);
  const weeks=employee.timesheets.filter(timesheet=>timesheet.entries.length).length;
  return <article className={`panel flex h-[252px] w-full flex-col p-4 ${archived?"bg-[#fafbfa]":""}`}>
    <Link href={`/manager/employees/${employee.id}`} className="group min-h-0 flex-1">
      <div className="flex items-start justify-between gap-3"><span className={`grid size-10 place-items-center rounded-full text-xs font-bold ${archived?"bg-[#e4e9e7] text-[#56635f]":"bg-[#d8efe9] text-[#075f51]"}`}>{initials(employee.name)}</span><ChevronRight className="text-[#87938f] transition-transform group-hover:translate-x-1" size={19}/></div>
      <h3 className="mt-3 truncate text-base font-bold">{employee.name}</h3>
      <p className="mt-1 flex items-center gap-2 truncate text-xs text-[#66736f]"><Mail className="shrink-0" size={14}/>{employee.email}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#e5eae8] py-3"><div><div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#66736f]"><Clock3 size={13}/>Total hours</div><div className="mt-1 text-sm font-bold">{formatDuration(total)}</div></div><div><div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#66736f]"><CalendarDays size={13}/>Weeks</div><div className="mt-1 text-sm font-bold">{weeks}</div></div></div>
    </Link>
    <div className="mt-3">{archived?<RestoreEmployeeButton employeeId={employee.id} name={employee.name}/>:<RemoveEmployeeButton employeeId={employee.id} name={employee.name}/>}</div>
  </article>;
}

function EmptyState({title,text}:{title:string;text:string}){return <div className="panel max-w-[660px] px-5 py-8 text-center"><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-[#66736f]">{text}</p></div>}
