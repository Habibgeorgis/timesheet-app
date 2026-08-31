import { Clock3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata={title:"Create account"};

export default async function SignupPage(){
  if(await getCurrentUser()) redirect("/dashboard");
  return <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section className="hidden bg-[#102a26] p-14 text-white lg:flex lg:flex-col"><div className="flex items-center gap-3 text-xl font-bold"><span className="grid size-10 place-items-center rounded-md bg-[#22a98f]"><Clock3/></span>Tempo</div><div className="my-auto max-w-xl"><p className="mb-4 text-sm font-bold uppercase text-[#6fd0ba]">Start tracking clearly</p><h1 className="text-5xl font-bold leading-[1.08]">One workspace for hours and weekly reports.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#b8cec8]">Create your account and begin with the access level that matches your work.</p></div><div className="flex items-center gap-2 text-sm text-[#9db6b0]"><ShieldCheck size={18}/>Secure, role-based access</div></section>
    <section className="flex items-center justify-center bg-white p-6 py-10"><div className="w-full max-w-[440px]"><div className="mb-8 flex items-center gap-3 text-xl font-bold lg:hidden"><Clock3 className="text-[#087f6b]"/>Tempo</div><h2 className="text-3xl font-bold">Create your account</h2><p className="mb-7 mt-2 text-[#66736f]">Register with your email and choose your role.</p><SignupForm/><p className="mt-6 text-center text-sm text-[#66736f]">Already have an account? <Link href="/login" className="font-bold text-[#087f6b] hover:underline">Sign in</Link></p></div></section>
  </main>;
}
