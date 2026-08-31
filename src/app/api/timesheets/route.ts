import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const timesheets=await prisma.timesheet.findMany({where:{userId:user.id},include:{entries:{include:{project:true}}},orderBy:{weekStart:"desc"}});return NextResponse.json({timesheets});}
