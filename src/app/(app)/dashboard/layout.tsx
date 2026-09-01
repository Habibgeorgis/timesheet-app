import { AppShell } from "@/components/app-shell";
import { requireSelectedEmployee } from "@/lib/selected-employee";
export default async function EmployeeDashboardLayout({children}:{children:React.ReactNode}) {const employee=await requireSelectedEmployee();return <AppShell mode="employee" employee={employee}>{children}</AppShell>}
