import { redirect } from "next/navigation";
import { ensureTimesheet } from "@/actions/timesheets";
import { dateKey, mondayOf } from "@/lib/dates";
import { requireSelectedEmployee } from "@/lib/selected-employee";
export default async function SelectedTimesheetPage({searchParams}:{searchParams:Promise<{week?:string}>}) {const [employee,{week}]=await Promise.all([requireSelectedEmployee(),searchParams]);const currentWeek=mondayOf(new Date());const requested=week&&/^\d{4}-\d{2}-\d{2}$/.test(week)?mondayOf(new Date(`${week}T12:00:00Z`)):currentWeek;const selectedWeek=dateKey(requested)>dateKey(currentWeek)?currentWeek:requested;const timesheet=await ensureTimesheet(selectedWeek,employee.id);redirect(`/timesheets/${timesheet.id}`)}
