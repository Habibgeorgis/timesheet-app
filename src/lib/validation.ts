import { z } from "zod";

export const managerEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Enter the employee name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const entrySchema = z.object({
  timesheetId: z.string().min(1),
  entryId: z.string().optional(),
  date: z.iso.date(),
  durationHours: z.coerce.number().int().min(0).max(24),
  durationMinutes: z.coerce.number().int().min(0).max(59),
}).refine(value=>value.durationHours>0||value.durationMinutes>0,{message:"Tracked time must be at least one minute",path:["durationMinutes"]}).refine(value=>value.durationHours<24||value.durationMinutes===0,{message:"The maximum duration is 24:00",path:["durationMinutes"]}).transform(({durationHours,durationMinutes,...entry})=>({...entry,duration:durationHours*60+durationMinutes}));
