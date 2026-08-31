"use client";

import { UserMinus } from "lucide-react";
import { deactivateEmployee } from "@/actions/employees";

export function RemoveEmployeeButton({employeeId,name}:{employeeId:string;name:string}){
  return <form action={deactivateEmployee} onSubmit={event=>{if(!window.confirm(`Remove ${name} from active employees? Their tracked hours will be preserved.`))event.preventDefault()}}><input type="hidden" name="employeeId" value={employeeId}/><button className="btn btn-danger w-full" title={`Remove ${name}`}><UserMinus size={17}/>Remove</button></form>;
}
