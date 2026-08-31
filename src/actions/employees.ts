"use server";

import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { managerEmployeeSchema } from "@/lib/validation";

type EmployeeField="name"|"email"|"password";
export type EmployeeFormState={
  error?:string;
  success?:string;
  fieldErrors?:Partial<Record<EmployeeField,string>>;
};

export async function addEmployee(_:EmployeeFormState,formData:FormData):Promise<EmployeeFormState>{
  await requireRole([Role.MANAGER,Role.ADMIN]);
  const result=managerEmployeeSchema.safeParse(Object.fromEntries(formData));
  if(!result.success){
    const fieldErrors:EmployeeFormState["fieldErrors"]={};
    for(const issue of result.error.issues){const field=issue.path[0] as EmployeeField|undefined;if(field&&!fieldErrors[field])fieldErrors[field]=issue.message}
    return {fieldErrors};
  }

  const {name,email,password}=result.data;
  const passwordHash=await bcrypt.hash(password,12);
  const existing=await prisma.user.findUnique({where:{email}});
  if(existing?.active)return {fieldErrors:{email:"This email already has an active account"}};
  if(existing&&existing.role!==Role.EMPLOYEE)return {fieldErrors:{email:"This email belongs to a manager account"}};

  try{
    if(existing){
      await prisma.user.update({where:{id:existing.id},data:{name,passwordHash,active:true}});
    }else{
      await prisma.user.create({data:{name,email,passwordHash,role:Role.EMPLOYEE}});
    }
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return {fieldErrors:{email:"This email is already registered"}};
    return {error:"The employee account could not be added. Try again."};
  }
  revalidatePath("/manager");
  return {success:existing?"Employee restored.":"Employee added."};
}

export async function deactivateEmployee(formData:FormData){
  await requireRole([Role.MANAGER,Role.ADMIN]);
  const employeeId=String(formData.get("employeeId")??"");
  const employee=await prisma.user.findFirst({where:{id:employeeId,role:Role.EMPLOYEE,active:true}});
  if(!employee)return;
  await prisma.$transaction([
    prisma.user.update({where:{id:employee.id},data:{active:false}}),
    prisma.session.deleteMany({where:{userId:employee.id}}),
  ]);
  revalidatePath("/manager");
}

export async function restoreEmployee(formData:FormData){
  await requireRole([Role.MANAGER,Role.ADMIN]);
  const employeeId=String(formData.get("employeeId")??"");
  const employee=await prisma.user.findFirst({where:{id:employeeId,role:Role.EMPLOYEE,active:false}});
  if(!employee)return;
  await prisma.user.update({where:{id:employee.id},data:{active:true}});
  revalidatePath("/manager");
  revalidatePath(`/manager/employees/${employee.id}`);
}
