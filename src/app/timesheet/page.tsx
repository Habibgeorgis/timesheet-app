import { redirect } from "next/navigation";
import { ensureTimesheet } from "@/actions/timesheets";
import { mondayOf } from "@/lib/dates";
import { requireSelectedEmployee } from "@/lib/selected-employee";
export default async function SelectedTimesheetPage({searchParams}:{searchParams:Promise<{week?:string}>}) {const [employee,{week}]=await Promise.all([requireSelectedEmployee(),searchParams]);const requested=week&&/^\d{4}-\d{2}-\d{2}$/.test(week)?new Date(`${week}T12:00:00Z`):new Date();const timesheet=await ensureTimesheet(mondayOf(requested),employee.id);redirect(`/timesheets/${timesheet.id}`)}
