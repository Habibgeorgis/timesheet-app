import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string()
    .min(12, "Use at least 12 characters")
    .max(128)
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number"),
  passwordConfirmation: z.string(),
  role: z.enum(["EMPLOYEE", "MANAGER"]),
}).refine((value) => value.password === value.passwordConfirmation, {
  message: "Passwords do not match",
  path: ["passwordConfirmation"],
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
