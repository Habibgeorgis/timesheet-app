"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Plus, UserPlus } from "lucide-react";
import { addEmployee } from "@/actions/employees";
import { cn } from "@/lib/utils";

export function AddEmployeeForm(){
  const [state,action,pending]=useActionState(addEmployee,{});
  const [values,setValues]=useState({name:"",email:"",password:""});
  const update=(field:keyof typeof values)=>(event:React.ChangeEvent<HTMLInputElement>)=>setValues(current=>({...current,[field]:event.target.value}));
  return <details className="relative">
    <summary className="btn btn-primary list-none"><UserPlus size={18}/>Add employee</summary>
    <form action={action} className="panel absolute right-0 z-20 mt-2 w-[min(380px,calc(100vw-32px))] space-y-4 p-5 shadow-xl" noValidate>
      <div><h2 className="font-bold">Add employee</h2><p className="mt-1 text-sm text-[#66736f]">Create an employee login for this workspace.</p></div>
      {state.error&&<div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      {state.success&&<div role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</div>}
      <Field label="Full name" name="name" value={values.name} onChange={update("name")} error={state.fieldErrors?.name}/>
      <Field label="Email" name="email" type="email" value={values.email} onChange={update("email")} error={state.fieldErrors?.email}/>
      <Field label="Initial password" name="password" type="password" value={values.password} onChange={update("password")} error={state.fieldErrors?.password} help="Any 4 or more characters."/>
      <button disabled={pending} className="btn btn-primary w-full">{pending?<LoaderCircle className="animate-spin" size={18}/>:<Plus size={18}/>}Add employee</button>
    </form>
  </details>;
}

function Field({label,name,type="text",value,onChange,error,help}:{label:string;name:string;type?:string;value:string;onChange:(event:React.ChangeEvent<HTMLInputElement>)=>void;error?:string;help?:string}){return <div><label className="label" htmlFor={`employee-${name}`}>{label}</label><input className={cn("input",error&&"input-error")} id={`employee-${name}`} name={name} type={type} value={value} onChange={onChange} autoComplete={type==="password"?"new-password":name}/>{error?<p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>:help?<p className="mt-1.5 text-xs text-[#66736f]">{help}</p>:null}</div>}
