import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { parseISO } from "date-fns";
import { Role } from "@prisma/client";
import { dateKey, mondayOf } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { getSelectedEmployee } from "@/lib/selected-employee";
import { TimesheetPdf } from "@/lib/timesheet-pdf";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const value = params.get("week");
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Response("Invalid week", { status: 400 });
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return new Response("Invalid week", { status: 400 });
  const weekStart = mondayOf(parsed);
  if (weekStart > mondayOf(new Date())) return new Response("Future weeks are not available", { status: 400 });

  const employeeId = params.get("employeeId");
  const reportUser=employeeId?await prisma.user.findFirst({where:{id:employeeId,role:Role.EMPLOYEE}}):await getSelectedEmployee();
  if(!reportUser)return new Response("Select an employee",{status:400});

  const timesheet = await prisma.timesheet.findUnique({
    where: { userId_weekStart: { userId: reportUser.id, weekStart } },
    include: { user: true, entries: { orderBy: { date: "asc" } } },
  });
  const report = timesheet ?? { weekStart, user: reportUser, entries: [] };
  const document = React.createElement(TimesheetPdf, { timesheet: report }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(document);
  const filename = reportUser.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="weekly-hours-${filename}-${dateKey(weekStart)}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
