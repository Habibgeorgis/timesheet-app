"use client";

import { UserCheck, UserMinus } from "lucide-react";
import { deactivateEmployee, restoreEmployee } from "@/actions/employees";

export function RemoveEmployeeButton({employeeId,name}:{employeeId:string;name:string}){
  return <form action={deactivateEmployee} onSubmit={event=>{if(!window.confirm(`Remove ${name} from active employees? Their tracked hours will be preserved.`))event.preventDefault()}}><input type="hidden" name="employeeId" value={employeeId}/><button className="btn btn-danger w-full" title={`Remove ${name}`}><UserMinus size={17}/>Remove</button></form>;
}

export function RestoreEmployeeButton({employeeId,name}:{employeeId:string;name:string}){
  return <form action={restoreEmployee}><input type="hidden" name="employeeId" value={employeeId}/><button className="btn btn-secondary w-full" title={`Restore ${name}`}><UserCheck size={17}/>Restore</button></form>;
}
