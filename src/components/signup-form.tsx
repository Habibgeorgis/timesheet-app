"use client";

import { useActionState, useState } from "react";
import { ArrowRight, BriefcaseBusiness, LoaderCircle, LockKeyhole, Mail, UserRound, Users } from "lucide-react";
import { signup, type SignupField } from "@/actions/auth";
import { cn } from "@/lib/utils";

export function SignupForm(){
  const [state,action,pending]=useActionState(signup,{});
  const [values,setValues]=useState({name:"",email:"",password:"",passwordConfirmation:"",role:"EMPLOYEE"});
  const error=(field:SignupField)=>state.fieldErrors?.[field];
  const update=(field:keyof typeof values)=>(event:React.ChangeEvent<HTMLInputElement>)=>setValues(current=>({...current,[field]:event.target.value}));

  return <form action={action} className="space-y-5" noValidate>
    {state.error&&<div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
    <div><label className="label" htmlFor="name">Full name</label><div className="relative"><UserRound className="absolute left-3 top-3 text-[#7d8a86]" size={18}/><input className={cn("input pl-10",error("name")&&"input-error")} id="name" name="name" autoComplete="name" placeholder="Your full name" value={values.name} onChange={update("name")} aria-invalid={Boolean(error("name"))} aria-describedby={error("name")?"name-error":undefined}/></div><FieldError id="name-error" message={error("name")}/></div>
    <div><label className="label" htmlFor="email">Work email</label><div className="relative"><Mail className="absolute left-3 top-3 text-[#7d8a86]" size={18}/><input className={cn("input pl-10",error("email")&&"input-error")} id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={values.email} onChange={update("email")} aria-invalid={Boolean(error("email"))} aria-describedby={error("email")?"email-error":undefined}/></div><FieldError id="email-error" message={error("email")}/></div>
    <fieldset><legend className="label">Account role</legend><div className={cn("grid grid-cols-2 gap-2 rounded-md",error("role")&&"ring-1 ring-red-400")}>
      <label className="cursor-pointer"><input className="peer sr-only" type="radio" name="role" value="EMPLOYEE" checked={values.role==="EMPLOYEE"} onChange={update("role")}/><span className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#cbd5d1] px-3 text-sm font-bold peer-checked:border-[#087f6b] peer-checked:bg-[#edf8f5] peer-checked:text-[#056353]"><BriefcaseBusiness size={17}/>Employee</span></label>
      <label className="cursor-pointer"><input className="peer sr-only" type="radio" name="role" value="MANAGER" checked={values.role==="MANAGER"} onChange={update("role")}/><span className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#cbd5d1] px-3 text-sm font-bold peer-checked:border-[#087f6b] peer-checked:bg-[#edf8f5] peer-checked:text-[#056353]"><Users size={17}/>Manager</span></label>
    </div><FieldError id="role-error" message={error("role")}/></fieldset>
    <div><label className="label" htmlFor="password">Password</label><div className="relative"><LockKeyhole className="absolute left-3 top-3 text-[#7d8a86]" size={18}/><input className={cn("input pl-10",error("password")&&"input-error")} id="password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={update("password")} aria-invalid={Boolean(error("password"))} aria-describedby={error("password")?"password-error":"password-help"}/></div><FieldError id="password-error" message={error("password")}/>{!error("password")&&<p id="password-help" className="mt-1.5 text-xs text-[#66736f]">Use any 4 or more characters.</p>}</div>
    <div><label className="label" htmlFor="passwordConfirmation">Confirm password</label><div className="relative"><LockKeyhole className="absolute left-3 top-3 text-[#7d8a86]" size={18}/><input className={cn("input pl-10",error("passwordConfirmation")&&"input-error")} id="passwordConfirmation" name="passwordConfirmation" type="password" autoComplete="new-password" value={values.passwordConfirmation} onChange={update("passwordConfirmation")} aria-invalid={Boolean(error("passwordConfirmation"))} aria-describedby={error("passwordConfirmation")?"password-confirmation-error":undefined}/></div><FieldError id="password-confirmation-error" message={error("passwordConfirmation")}/></div>
    <button disabled={pending} className="btn btn-primary w-full">{pending?<LoaderCircle className="animate-spin" size={18}/>:<>Create account<ArrowRight size={18}/></>}</button>
  </form>;
}

function FieldError({id,message}:{id:string;message?:string}){return message?<p id={id} role="alert" className="mt-1.5 text-xs font-semibold text-red-600">{message}</p>:null}
