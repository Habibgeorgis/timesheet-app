import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(128),
});

export const entrySchema = z.object({
  timesheetId: z.string().min(1),
  entryId: z.string().optional(),
  projectId: z.string().min(1, "Select a project"),
  date: z.iso.date(),
  hours: z.coerce.number().min(0.25).max(24),
  description: z.string().trim().max(500).optional(),
  billable: z.coerce.boolean().default(false),
});

export const reviewSchema = z.object({
  timesheetId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().trim().max(500).optional(),
}).refine((value) => value.decision !== "REJECTED" || Boolean(value.note), {
  message: "A note is required when rejecting a timesheet",
  path: ["note"],
});

