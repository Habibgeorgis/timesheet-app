"use server";

import { AuditAction, TimesheetStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDateInWeek } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/lib/validation";

export type ActionState = { error?: string; success?: string };

export async function saveEntry(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const result = entrySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid entry." };
  const { timesheetId, entryId, projectId, date, hours, description, billable } = result.data;
  const timesheet = await prisma.timesheet.findFirst({ where: { id: timesheetId, userId: user.id } });
  if (!timesheet) return { error: "Timesheet not found." };
  if (timesheet.status !== TimesheetStatus.DRAFT && timesheet.status !== TimesheetStatus.REJECTED) return { error: "This timesheet is locked." };
  const entryDate = new Date(`${date}T12:00:00Z`);
  if (!isDateInWeek(entryDate, timesheet.weekStart)) return { error: "Entry date must be inside this week." };
  const minutes = Math.round(hours * 60);
  const existingDayMinutes = await prisma.timeEntry.aggregate({
    where: { timesheetId, date: entryDate, ...(entryId ? { id: { not: entryId } } : {}) },
    _sum: { minutes: true },
  });
  if ((existingDayMinutes._sum.minutes ?? 0) + minutes > 1440) return { error: "A day cannot contain more than 24 hours." };

  await prisma.$transaction(async (tx) => {
    if (entryId) {
      const existing = await tx.timeEntry.findFirst({ where: { id: entryId, timesheetId } });
      if (!existing) throw new Error("Entry not found");
      await tx.timeEntry.update({ where: { id: entryId }, data: { projectId, date: entryDate, minutes, description, billable } });
    } else {
      await tx.timeEntry.create({ data: { timesheetId, projectId, date: entryDate, minutes, description, billable } });
    }
    await tx.auditEvent.create({ data: { timesheetId, actorId: user.id, action: entryId ? AuditAction.UPDATED : AuditAction.CREATED, details: `${entryId ? "Updated" : "Added"} ${minutes} minutes` } });
    if (timesheet.status === TimesheetStatus.REJECTED) await tx.timesheet.update({ where: { id: timesheetId }, data: { status: TimesheetStatus.DRAFT } });
  });
  revalidatePath(`/timesheets/${timesheetId}`);
  revalidatePath("/dashboard");
  return { success: entryId ? "Entry updated." : "Time added." };
}

export async function deleteEntry(formData: FormData) {
  const user = await requireUser();
  const entryId = String(formData.get("entryId") ?? "");
  const entry = await prisma.timeEntry.findFirst({ where: { id: entryId, timesheet: { userId: user.id, status: { in: [TimesheetStatus.DRAFT, TimesheetStatus.REJECTED] } } } });
  if (!entry) return;
  await prisma.timeEntry.delete({ where: { id: entry.id } });
  revalidatePath(`/timesheets/${entry.timesheetId}`);
}

export async function submitTimesheet(formData: FormData) {
  const user = await requireUser();
  const timesheetId = String(formData.get("timesheetId") ?? "");
  const timesheet = await prisma.timesheet.findFirst({ where: { id: timesheetId, userId: user.id }, include: { entries: true } });
  if (!timesheet || (timesheet.status !== TimesheetStatus.DRAFT && timesheet.status !== TimesheetStatus.REJECTED)) return;
  if (timesheet.entries.length === 0) redirect(`/timesheets/${timesheetId}?error=Add+at+least+one+entry+before+submitting`);
  await prisma.$transaction([
    prisma.timesheet.update({ where: { id: timesheetId }, data: { status: TimesheetStatus.SUBMITTED, submittedAt: new Date(), reviewedAt: null, reviewedById: null } }),
    prisma.auditEvent.create({ data: { timesheetId, actorId: user.id, action: AuditAction.SUBMITTED } }),
  ]);
  revalidatePath("/dashboard");
  redirect(`/timesheets/${timesheetId}`);
}

export async function ensureTimesheet(weekStart: Date, userId: string) {
  return prisma.timesheet.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    update: {},
    create: { userId, weekStart },
  });
}
