import { CalendarDays, Clock3, LayoutDashboard, LogOut, Users } from "lucide-react";
import Link from "next/link";
import type { User } from "@prisma/client";
import { logout } from "@/actions/auth";
import { initials } from "@/lib/utils";

const employeeLinks=[{href:"/dashboard",label:"Overview",icon:LayoutDashboard},{href:"/timesheets",label:"My tracking",icon:CalendarDays}];
export function AppShell({user,children}:{user:User;children:React.ReactNode}) {
  const manager=user.role==="MANAGER"||user.role==="ADMIN";
  const links=manager?[{href:"/manager",label:"Employees",icon:Users}]:employeeLinks;
  const home=manager?"/manager":"/dashboard";
  return <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
    <aside className="desktop-only fixed inset-y-0 left-0 z-20 flex w-[232px] flex-col bg-[#102a26] px-3 py-5 text-white">
      <Link href={home} className="mb-8 flex items-center gap-3 px-3 text-xl font-bold"><span className="grid size-9 place-items-center rounded-md bg-[#22a98f]"><Clock3 size={20}/></span>Time Track</Link>
      <nav className="space-y-1">{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#c8dad5] hover:bg-white/10 hover:text-white"><Icon size={18}/>{label}</Link>)}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4"><div className="mb-3 flex items-center gap-3 px-2"><span className="grid size-9 place-items-center rounded-full bg-[#d8efe9] text-xs font-bold text-[#075f51]">{initials(user.name)}</span><div className="min-w-0"><div className="truncate text-sm font-bold">{user.name}</div><div className="text-xs text-[#91aaa4]">{user.role.toLowerCase()}</div></div></div><form action={logout}><button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#c8dad5] hover:bg-white/10"><LogOut size={17}/>Sign out</button></form></div>
    </aside>
    <div className="md:col-start-2"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#dce3e0] bg-white px-4 md:px-8"><Link href={home} className="flex items-center gap-2 font-bold md:hidden"><Clock3 className="text-[#087f6b]"/>Time Track</Link><div className="desktop-only text-sm text-[#66736f]">{manager?"Employee workspace":"Time tracking workspace"}</div><div className="flex items-center gap-3 text-sm font-semibold"><span className="hidden sm:inline">{user.name}</span><span className="grid size-8 place-items-center rounded-full bg-[#d8efe9] text-xs text-[#075f51]">{initials(user.name)}</span></div></header><main className="mx-auto max-w-[1280px] p-4 pb-24 md:p-8">{children}</main>
    <nav className={`fixed inset-x-0 bottom-0 z-20 grid border-t bg-white py-2 md:hidden ${manager?"grid-cols-2":"grid-cols-3"}`}>{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className="flex flex-col items-center gap-1 text-[10px] text-[#52615d]"><Icon size={18}/>{label.split(" ")[0]}</Link>)}<form action={logout}><button className="flex w-full flex-col items-center gap-1 text-[10px] text-[#52615d]"><LogOut size={18}/>Exit</button></form></nav></div>
  </div>;
}
