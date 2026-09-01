"use server";

import { Prisma, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { managerEmployeeSchema } from "@/lib/validation";

type EmployeeField="name"|"email"|"employeeCode"|"jobTitle";
export type EmployeeFormState={
  error?:string;
  success?:string;
  fieldErrors?:Partial<Record<EmployeeField,string>>;
};

export async function addEmployee(_:EmployeeFormState,formData:FormData):Promise<EmployeeFormState>{
  const result=managerEmployeeSchema.safeParse(Object.fromEntries(formData));
  if(!result.success){
    const fieldErrors:EmployeeFormState["fieldErrors"]={};
    for(const issue of result.error.issues){const field=issue.path[0] as EmployeeField|undefined;if(field&&!fieldErrors[field])fieldErrors[field]=issue.message}
    return {fieldErrors};
  }

  const {name,email,employeeCode,jobTitle}=result.data;
  const existing=await prisma.user.findUnique({where:{email}});
  if(existing?.active)return {fieldErrors:{email:"This email already has an active account"}};
  if(existing&&existing.role!==Role.EMPLOYEE)return {fieldErrors:{email:"This email belongs to a manager account"}};

  try{
    if(existing){
      await prisma.user.update({where:{id:existing.id},data:{name,employeeCode,jobTitle,active:true}});
    }else{
      await prisma.user.create({data:{name,email,employeeCode,jobTitle,role:Role.EMPLOYEE}});
    }
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return {error:"Employee ID or email is already in use."};
    return {error:"The employee account could not be added. Try again."};
  }
  revalidatePath("/manager");
  revalidatePath("/employee");
  return {success:existing?"Employee restored.":"Employee added."};
}

export async function deactivateEmployee(employeeId:string){
  const employee=await prisma.user.findFirst({where:{id:employeeId,role:Role.EMPLOYEE,active:true}});
  if(!employee)return;
  await prisma.user.update({where:{id:employee.id},data:{active:false}});
  revalidatePath("/manager");
}

export async function restoreEmployee(employeeId:string){
  const employee=await prisma.user.findFirst({where:{id:employeeId,role:Role.EMPLOYEE,active:false}});
  if(!employee)return;
  await prisma.user.update({where:{id:employee.id},data:{active:true}});
  revalidatePath("/manager");
  revalidatePath(`/manager/employees/${employee.id}`);
}

export async function deleteEmployee(employeeId:string){
  const employee=await prisma.user.findFirst({where:{id:employeeId,role:Role.EMPLOYEE,active:false}});
  if(!employee)return;
  await prisma.$transaction(async tx=>{
    await tx.auditEvent.deleteMany({where:{actorId:employee.id}});
    await tx.timesheet.deleteMany({where:{userId:employee.id}});
    await tx.user.delete({where:{id:employee.id}});
  });
  revalidatePath("/manager");
}
