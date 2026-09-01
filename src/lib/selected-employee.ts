import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const EMPLOYEE_COOKIE = "time_track_employee";

export async function getSelectedEmployee() {
  const employeeId = (await cookies()).get(EMPLOYEE_COOKIE)?.value;
  if (!employeeId) return null;
  return prisma.user.findFirst({ where: { id: employeeId, role: Role.EMPLOYEE, active: true } });
}

export async function requireSelectedEmployee() {
  const employee = await getSelectedEmployee();
  if (!employee) redirect("/employee");
  return employee;
}

export async function rememberEmployee(employeeId: string) {
  (await cookies()).set(EMPLOYEE_COOKIE, employeeId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
