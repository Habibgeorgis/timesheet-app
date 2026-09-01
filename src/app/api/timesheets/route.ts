import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSelectedEmployee } from "@/lib/selected-employee";
export async function GET(){const employee=await getSelectedEmployee();if(!employee)return NextResponse.json({error:"Select an employee"},{status:400});const timesheets=await prisma.timesheet.findMany({where:{userId:employee.id},include:{entries:true},orderBy:{weekStart:"desc"}});return NextResponse.json({timesheets});}
