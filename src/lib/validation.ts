import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(4).max(128),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(4, "Use at least 4 characters").max(128),
  passwordConfirmation: z.string(),
  role: z.enum(["EMPLOYEE", "MANAGER"]),
}).refine((value) => value.password === value.passwordConfirmation, {
  message: "Passwords do not match",
  path: ["passwordConfirmation"],
});

export const managerEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Enter the employee name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(4, "Use at least 4 characters").max(128),
});

const durationSchema = z.string()
  .trim()
  .regex(/^(?:(?:[01]?\d|2[0-3]):[0-5]\d|24:00)$/, "Enter time as hours:minutes, for example 7:30")
  .transform((value) => {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  })
  .refine((minutes) => minutes > 0, "Tracked time must be at least one minute");

export const entrySchema = z.object({
  timesheetId: z.string().min(1),
  entryId: z.string().optional(),
  date: z.iso.date(),
  duration: durationSchema,
});
