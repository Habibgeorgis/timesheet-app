import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimesheetPdf } from "@/lib/timesheet-pdf";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const user=await getCurrentUser();if(!user)return new Response("Unauthorized",{status:401});const {id}=await params;const row=await prisma.timesheet.findUnique({where:{id},include:{user:true,entries:{orderBy:{date:"asc"}}}});if(!row)return new Response("Not found",{status:404});const elevated=user.role===Role.MANAGER||user.role===Role.ADMIN;if(row.userId!==user.id&&!elevated)return new Response("Forbidden",{status:403});const document=React.createElement(TimesheetPdf,{timesheet:row}) as unknown as Parameters<typeof renderToBuffer>[0];const buffer=await renderToBuffer(document);return new Response(new Uint8Array(buffer),{headers:{"content-type":"application/pdf","content-disposition":`attachment; filename="weekly-hours-${row.user.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${row.weekStart.toISOString().slice(0,10)}.pdf"`,"cache-control":"private, no-store"}})}
