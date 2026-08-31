"use server";

import { AuditAction, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDateInWeek, weekFromInput } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/lib/validation";

export type ActionState = { error?: string; success?: string };

export async function saveEntry(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role === Role.MANAGER || user.role === Role.ADMIN) return { error: "Time tracking is available to employees only." };
  const result = entrySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid entry." };
  const { timesheetId, entryId, date, hours } = result.data;
  const timesheet = await prisma.timesheet.findFirst({ where: { id: timesheetId, userId: user.id } });
  if (!timesheet) return { error: "Timesheet not found." };
  const entryDate = new Date(`${date}T12:00:00Z`);
  if (!isDateInWeek(entryDate, timesheet.weekStart)) return { error: "Entry date must be inside this week." };
  const minutes = Math.round(hours * 60);
  const existingDayMinutes = await prisma.timeEntry.aggregate({
    where: { timesheetId, date: entryDate, ...(entryId ? { id: { not: entryId } } : {}) },
    _sum: { minutes: true },
  });
  if ((existingDayMinutes._sum.minutes ?? 0) + minutes > 1440) return { error: "A day cannot contain more than 24 hours." };

  await prisma.$transaction(async (tx) => {
    const generalProject = await tx.project.upsert({
      where: { code: "GENERAL" },
      update: { active: true },
      create: { code: "GENERAL", name: "General time", color: "#087F6B" },
    });
    if (entryId) {
      const existing = await tx.timeEntry.findFirst({ where: { id: entryId, timesheetId } });
      if (!existing) throw new Error("Entry not found");
      await tx.timeEntry.update({ where: { id: entryId }, data: { projectId: generalProject.id, date: entryDate, minutes, description: null, billable: true } });
    } else {
      await tx.timeEntry.create({ data: { timesheetId, projectId: generalProject.id, date: entryDate, minutes, billable: true } });
    }
    await tx.auditEvent.create({ data: { timesheetId, actorId: user.id, action: entryId ? AuditAction.UPDATED : AuditAction.CREATED, details: `${entryId ? "Updated" : "Added"} ${minutes} minutes` } });
  });
  revalidatePath(`/timesheets/${timesheetId}`);
  revalidatePath("/dashboard");
  return { success: entryId ? "Entry updated." : "Time added." };
}

export async function deleteEntry(formData: FormData) {
  const user = await requireUser();
  if (user.role === Role.MANAGER || user.role === Role.ADMIN) return;
  const entryId = String(formData.get("entryId") ?? "");
  const entry = await prisma.timeEntry.findFirst({ where: { id: entryId, timesheet: { userId: user.id } } });
  if (!entry) return;
  await prisma.timeEntry.delete({ where: { id: entry.id } });
  revalidatePath(`/timesheets/${entry.timesheetId}`);
}

export async function openWeek(formData: FormData) {
  const user = await requireUser();
  if (user.role === Role.MANAGER || user.role === Role.ADMIN) redirect("/manager");
  const weekStart = weekFromInput(String(formData.get("week") ?? ""));
  if (!weekStart) redirect("/timesheets");
  const timesheet = await ensureTimesheet(weekStart, user.id);
  redirect(`/timesheets/${timesheet.id}`);
}

export async function ensureTimesheet(weekStart: Date, userId: string) {
  return prisma.timesheet.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    update: {},
    create: { userId, weekStart },
  });
}
