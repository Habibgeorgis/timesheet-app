import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";

type SignupField="name"|"email"|"password"|"passwordConfirmation"|"role";

export async function POST(request:Request){
  let body:unknown;
  try{body=await request.json()}catch{return NextResponse.json({error:"Enter your registration details."},{status:400})}
  const result=signupSchema.safeParse(body);
  if(!result.success){
    const fieldErrors:Partial<Record<SignupField,string>>={};
    for(const issue of result.error.issues){const field=issue.path[0] as SignupField|undefined;if(field&&!fieldErrors[field])fieldErrors[field]=issue.message}
    return NextResponse.json({fieldErrors},{status:400});
  }

  const {name,email,password,role}=result.data;
  try{
    const user=await prisma.user.create({data:{name,email,passwordHash:await bcrypt.hash(password,12),role}});
    await createSession(user.id);
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return NextResponse.json({fieldErrors:{email:"This email is already registered"}},{status:409});
    return NextResponse.json({error:"We could not create your account. Please try again."},{status:500});
  }
  return NextResponse.json({ok:true},{status:201});
}
