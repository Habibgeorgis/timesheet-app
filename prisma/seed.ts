import { PrismaClient, Role, TimesheetStatus, AuditAction } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, startOfWeek, subWeeks } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Timesheet123!", 12);

  const [manager, employee, employeeTwo] = await Promise.all([
    prisma.user.upsert({
      where: { email: "manager@acme.test" },
      update: {},
      create: { name: "Maya Chen", email: "manager@acme.test", passwordHash, role: Role.MANAGER, department: "Operations" },
    }),
    prisma.user.upsert({
      where: { email: "employee@acme.test" },
      update: {},
      create: { name: "Alex Morgan", email: "employee@acme.test", passwordHash, role: Role.EMPLOYEE, department: "Product" },
    }),
    prisma.user.upsert({
      where: { email: "jordan@acme.test" },
      update: {},
      create: { name: "Jordan Lee", email: "jordan@acme.test", passwordHash, role: Role.EMPLOYEE, department: "Engineering" },
    }),
  ]);

  const projects = await Promise.all([
    prisma.project.upsert({ where: { code: "WEB-24" }, update: {}, create: { code: "WEB-24", name: "Website refresh", client: "Northstar Labs", color: "#0F766E" } }),
    prisma.project.upsert({ where: { code: "OPS-12" }, update: {}, create: { code: "OPS-12", name: "Internal operations", client: "Acme", color: "#2563EB" } }),
    prisma.project.upsert({ where: { code: "MOB-08" }, update: {}, create: { code: "MOB-08", name: "Mobile application", client: "Fieldstone", color: "#CA8A04" } }),
  ]);

  const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const previousWeek = subWeeks(currentWeek, 1);

  const approved = await prisma.timesheet.upsert({
    where: { userId_weekStart: { userId: employee.id, weekStart: previousWeek } },
    update: {},
    create: {
      userId: employee.id,
      weekStart: previousWeek,
      status: TimesheetStatus.APPROVED,
      submittedAt: addDays(previousWeek, 5),
      reviewedAt: addDays(previousWeek, 6),
      reviewedById: manager.id,
      entries: {
        create: Array.from({ length: 5 }, (_, day) => ({
          date: addDays(previousWeek, day),
          minutes: day === 2 ? 420 : 480,
          description: day === 2 ? "Design review and sprint planning" : "Feature delivery and team collaboration",
          projectId: projects[day % 2].id,
          billable: day % 2 === 0,
        })),
      },
    },
  });

  await prisma.auditEvent.upsert({
    where: { id: `seed-${approved.id}` },
    update: {},
    create: { id: `seed-${approved.id}`, timesheetId: approved.id, actorId: manager.id, action: AuditAction.APPROVED, details: "Approved during seed setup" },
  });

  await prisma.timesheet.upsert({
    where: { userId_weekStart: { userId: employeeTwo.id, weekStart: currentWeek } },
    update: {},
    create: {
      userId: employeeTwo.id,
      weekStart: currentWeek,
      status: TimesheetStatus.SUBMITTED,
      submittedAt: new Date(),
      entries: { create: Array.from({ length: 5 }, (_, day) => ({ date: addDays(currentWeek, day), minutes: 450, description: "Mobile feature development", projectId: projects[2].id })) },
    },
  });

  console.log("Seeded manager@acme.test and employee@acme.test (password: Timesheet123!)");
}

main().finally(() => prisma.$disconnect());
