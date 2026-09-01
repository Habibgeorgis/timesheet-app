"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderCircle, Plus, UserPlus } from "lucide-react";
import { addEmployee } from "@/actions/employees";
import { cn } from "@/lib/utils";

export function AddEmployeeForm({selectionCard=false}:{selectionCard?:boolean}){
  const [state,action,pending]=useActionState(addEmployee,{});
  const detailsRef=useRef<HTMLDetailsElement>(null);
  const formRef=useRef<HTMLFormElement>(null);
  useEffect(()=>{
    const closeOnOutsideClick=(event:PointerEvent)=>{if(detailsRef.current?.open&&!detailsRef.current.contains(event.target as Node))detailsRef.current.removeAttribute("open")};
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")detailsRef.current?.removeAttribute("open")};
    document.addEventListener("pointerdown",closeOnOutsideClick);
    document.addEventListener("keydown",closeOnEscape);
    return ()=>{document.removeEventListener("pointerdown",closeOnOutsideClick);document.removeEventListener("keydown",closeOnEscape)};
  },[]);
  useEffect(()=>{if(state.success){detailsRef.current?.removeAttribute("open");formRef.current?.reset()}},[state.success]);
  return <details ref={detailsRef} className={selectionCard?"relative h-40":"relative"}>
    <summary className={selectionCard?"flex h-40 cursor-pointer list-none flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#aebbb7] bg-white p-5 text-center font-bold text-[#087f6b] transition hover:border-[#087f6b] hover:bg-[#f5faf8]":"btn btn-primary list-none"}>{selectionCard?<><span className="grid size-11 place-items-center rounded-full bg-[#e8f4f1]"><Plus size={24}/></span><span>Add employee</span></>:<><UserPlus size={18}/>Add employee</>}</summary>
    <form ref={formRef} action={action} className="panel absolute right-0 z-20 mt-2 w-[min(380px,calc(100vw-32px))] space-y-4 p-5 shadow-xl" noValidate>
      <div><h2 className="font-bold">Add employee</h2><p className="mt-1 text-sm text-[#66736f]">Add a profile to the employee selector.</p></div>
      {state.error&&<div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      {state.success&&<div role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</div>}
      <Field label="Full name" name="name" error={state.fieldErrors?.name}/>
      <Field label="Email" name="email" type="email" error={state.fieldErrors?.email}/>
      <button disabled={pending} className="btn btn-primary w-full">{pending?<LoaderCircle className="animate-spin" size={18}/>:<Plus size={18}/>}Add employee</button>
    </form>
  </details>;
}

function Field({label,name,type="text",error}:{label:string;name:string;type?:string;error?:string}){return <div><label className="label" htmlFor={`employee-${name}`}>{label}</label><input className={cn("input",error&&"input-error")} id={`employee-${name}`} name={name} type={type} autoComplete={name}/>{error&&<p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}</div>}
