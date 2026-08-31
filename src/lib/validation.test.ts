import { describe, expect, it } from "vitest";
import { signupSchema } from "@/lib/validation";

const validSignup={name:"Aster Bekele",email:"ASTER@EXAMPLE.COM ",password:"SecurePassword9",passwordConfirmation:"SecurePassword9",role:"EMPLOYEE"};

describe("signupSchema",()=>{
  it("normalizes valid registration data",()=>{
    const result=signupSchema.parse(validSignup);
    expect(result.email).toBe("aster@example.com");
    expect(result.role).toBe("EMPLOYEE");
  });

  it("allows manager registrations but never admin registrations",()=>{
    expect(signupSchema.safeParse({...validSignup,role:"MANAGER"}).success).toBe(true);
    expect(signupSchema.safeParse({...validSignup,role:"ADMIN"}).success).toBe(false);
  });

  it("rejects weak or mismatched passwords",()=>{
    expect(signupSchema.safeParse({...validSignup,password:"weakpassword",passwordConfirmation:"weakpassword"}).success).toBe(false);
    expect(signupSchema.safeParse({...validSignup,passwordConfirmation:"DifferentPassword9"}).success).toBe(false);
  });
});
