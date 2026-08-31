import { CalendarDays, ChevronRight, Clock3, Mail } from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";
import { AddEmployeeForm } from "@/components/add-employee-form";
import { RemoveEmployeeButton } from "@/components/remove-employee-button";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration, initials } from "@/lib/utils";

export const metadata={title:"Employees"};

export default async function ManagerPage(){
  await requireRole([Role.MANAGER,Role.ADMIN]);
  const employees=await prisma.user.findMany({
    where:{role:Role.EMPLOYEE,active:true},
    include:{timesheets:{include:{entries:true},orderBy:{weekStart:"desc"}}},
    orderBy:{name:"asc"},
  });

  return <>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Employees</h1><p className="mt-2 text-[#66736f]">Select an employee to review all weekly and daily hours.</p></div><AddEmployeeForm/></div>
    {employees.length?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{employees.map(employee=>{
      const entries=employee.timesheets.flatMap(timesheet=>timesheet.entries);
      const total=entries.reduce((sum,entry)=>sum+entry.minutes,0);
      const weeks=employee.timesheets.filter(timesheet=>timesheet.entries.length).length;
      return <article key={employee.id} className="panel flex min-h-[250px] flex-col p-5">
        <Link href={`/manager/employees/${employee.id}`} className="group flex-1">
          <div className="flex items-start justify-between gap-3"><span className="grid size-12 place-items-center rounded-full bg-[#d8efe9] text-sm font-bold text-[#075f51]">{initials(employee.name)}</span><ChevronRight className="text-[#87938f] transition-transform group-hover:translate-x-1" size={20}/></div>
          <h2 className="mt-4 text-lg font-bold">{employee.name}</h2>
          <p className="mt-1 flex items-center gap-2 truncate text-sm text-[#66736f]"><Mail size={15}/>{employee.email}</p>
          <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#e5eae8] py-4"><div><div className="flex items-center gap-1.5 text-xs font-semibold text-[#66736f]"><Clock3 size={14}/>Total hours</div><div className="mt-1 font-bold">{formatDuration(total)}</div></div><div><div className="flex items-center gap-1.5 text-xs font-semibold text-[#66736f]"><CalendarDays size={14}/>Tracked weeks</div><div className="mt-1 font-bold">{weeks}</div></div></div>
        </Link>
        <div className="mt-4"><RemoveEmployeeButton employeeId={employee.id} name={employee.name}/></div>
      </article>;
    })}</div>:<div className="panel p-12 text-center"><h2 className="font-bold">No employees yet</h2><p className="mt-1 text-sm text-[#66736f]">Add an employee to begin collecting tracked hours.</p></div>}
  </>;
}
