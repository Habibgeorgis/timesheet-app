"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2, UserCheck, UserMinus } from "lucide-react";
import { deactivateEmployee, deleteEmployee, restoreEmployee } from "@/actions/employees";

export function RemoveEmployeeButton({employeeId,name}:{employeeId:string;name:string}){
  const [pending,startTransition]=useTransition();
  const router=useRouter();
  function remove(){
    if(!window.confirm(`Remove ${name} from active employees? Their tracked hours will be preserved.`))return;
    startTransition(async()=>{await deactivateEmployee(employeeId);router.refresh()});
  }
  return <button type="button" onClick={remove} disabled={pending} className="btn btn-danger w-full" title={`Remove ${name}`}>{pending?<LoaderCircle className="animate-spin" size={17}/>:<UserMinus size={17}/>}Remove</button>;
}

export function RestoreEmployeeButton({employeeId,name}:{employeeId:string;name:string}){
  const [pending,startTransition]=useTransition();
  const router=useRouter();
  function restore(){startTransition(async()=>{await restoreEmployee(employeeId);router.refresh()})}
  return <button type="button" onClick={restore} disabled={pending} className="btn btn-secondary w-full" title={`Restore ${name}`}>{pending?<LoaderCircle className="animate-spin" size={17}/>:<UserCheck size={17}/>}Restore</button>;
}

export function DeleteEmployeeButton({employeeId,name}:{employeeId:string;name:string}){
  const [pending,startTransition]=useTransition();
  const router=useRouter();
  function removePermanently(){
    if(!window.confirm(`Permanently delete ${name}? Their account, tracked hours, and reports will be deleted and cannot be restored.`))return;
    startTransition(async()=>{await deleteEmployee(employeeId);router.replace("/manager");router.refresh()});
  }
  return <button type="button" onClick={removePermanently} disabled={pending} className="btn btn-danger w-full" title={`Permanently delete ${name}`}>{pending?<LoaderCircle className="animate-spin" size={17}/>:<Trash2 size={17}/>}Delete employee</button>;
}
