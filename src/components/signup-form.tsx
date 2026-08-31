"use client";

import { useActionState } from "react";
import { ArrowRight, BriefcaseBusiness, LoaderCircle, LockKeyhole, Mail, UserRound, Users } from "lucide-react";
import { signup } from "@/actions/auth";

export function SignupForm(){
  const [state,action,pending]=useActionState(signup,{});
  return <form action={action} className="space-y-5">
    {state.error&&<div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
    <div><label className="label" htmlFor="name">Full name</label><div className="relative"><UserRound className="absolute left-3 top-3 text-[#7d8a86]" size={18}/><input className="input pl-10" id="name" name="name" autoComplete="name" placeholder="Your full name" minLength={2} maxLength={80} required/></div></div>
    <div><label className="label" htmlFor="email">Work email</label><div className="relative"><Mail className="absolute left-3 top-3 text-[#7d8a86]" size={18}/><input className="input pl-10" id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required/></div></div>
    <fieldset><legend className="label">Account role</legend><div className="grid grid-cols-2 gap-2">
      <label className="cursor-pointer"><input className="peer sr-only" type="radio" name="role" value="EMPLOYEE" defaultChecked/><span className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#cbd5d1] px-3 text-sm font-bold peer-checked:border-[#087f6b] peer-checked:bg-[#edf8f5] peer-checked:text-[#056353]"><BriefcaseBusiness size={17}/>Employee</span></label>
      <label className="cursor-pointer"><input className="peer sr-only" type="radio" name="role" value="MANAGER"/><span className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#cbd5d1] px-3 text-sm font-bold peer-checked:border-[#087f6b] peer-checked:bg-[#edf8f5] peer-checked:text-[#056353]"><Users size={17}/>Manager</span></label>
    </div></fieldset>
    <div><label className="label" htmlFor="password">Password</label><div className="relative"><LockKeyhole className="absolute left-3 top-3 text-[#7d8a86]" size={18}/><input className="input pl-10" id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></div><p className="mt-1.5 text-xs text-[#66736f]">At least 12 characters with uppercase, lowercase, and a number.</p></div>
    <div><label className="label" htmlFor="passwordConfirmation">Confirm password</label><div className="relative"><LockKeyhole className="absolute left-3 top-3 text-[#7d8a86]" size={18}/><input className="input pl-10" id="passwordConfirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></div></div>
    <button disabled={pending} className="btn btn-primary w-full">{pending?<LoaderCircle className="animate-spin" size={18}/>:<>Create account<ArrowRight size={18}/></>}</button>
  </form>;
}
