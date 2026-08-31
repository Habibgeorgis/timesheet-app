"use server";

import { AuditAction, Role, TimesheetStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validation";

export async function reviewTimesheet(formData: FormData) {
  const manager = await requireRole([Role.MANAGER, Role.ADMIN]);
  const result = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return;
  const { timesheetId, decision, note } = result.data;
  const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId } });
  if (!timesheet || timesheet.status !== TimesheetStatus.SUBMITTED) return;
  await prisma.$transaction([
    prisma.timesheet.update({ where: { id: timesheetId }, data: { status: decision, reviewedAt: new Date(), reviewedById: manager.id, reviewNote: note || null } }),
    prisma.auditEvent.create({ data: { timesheetId, actorId: manager.id, action: decision === "APPROVED" ? AuditAction.APPROVED : AuditAction.REJECTED, details: note } }),
  ]);
  revalidatePath("/manager");
  revalidatePath(`/manager/timesheets/${timesheetId}`);
  revalidatePath(`/timesheets/${timesheetId}`);
}
