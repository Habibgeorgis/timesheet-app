import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { parseISO } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { dateKey, mondayOf } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { TimesheetPdf } from "@/lib/timesheet-pdf";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const value = new URL(request.url).searchParams.get("week");
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Response("Invalid week", { status: 400 });
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return new Response("Invalid week", { status: 400 });
  const weekStart = mondayOf(parsed);
  if (weekStart > mondayOf(new Date())) return new Response("Future weeks are not available", { status: 400 });

  const timesheet = await prisma.timesheet.findUnique({
    where: { userId_weekStart: { userId: user.id, weekStart } },
    include: { user: true, entries: { orderBy: { date: "asc" } } },
  });
  const report = timesheet ?? { weekStart, user, entries: [] };
  const document = React.createElement(TimesheetPdf, { timesheet: report }) as unknown as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(document);
  const filename = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="weekly-hours-${filename}-${dateKey(weekStart)}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
