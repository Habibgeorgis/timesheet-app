"use server";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rememberEmployee } from "@/lib/selected-employee";

export async function selectEmployee(formData: FormData) {
  const employeeId = String(formData.get("employeeId") ?? "");
  const employee = await prisma.user.findFirst({ where: { id: employeeId, role: Role.EMPLOYEE, active: true }, select: { id: true } });
  if (!employee) redirect("/employee?error=selection");
  await rememberEmployee(employee.id);
  redirect("/timesheet");
}
