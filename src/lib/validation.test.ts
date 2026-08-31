import { describe, expect, it } from "vitest";
import { entrySchema, managerEmployeeSchema, signupSchema } from "@/lib/validation";

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

  it("allows any four-character password but rejects shorter or mismatched values",()=>{
    expect(signupSchema.safeParse({...validSignup,password:"!!!!",passwordConfirmation:"!!!!"}).success).toBe(true);
    expect(signupSchema.safeParse({...validSignup,password:"abc",passwordConfirmation:"abc"}).success).toBe(false);
    expect(signupSchema.safeParse({...validSignup,passwordConfirmation:"DifferentPassword9"}).success).toBe(false);
  });
});

describe("managerEmployeeSchema",()=>{
  it("validates employee accounts with the same simple password rule",()=>{
    expect(managerEmployeeSchema.safeParse({name:"New Employee",email:"new@example.com",password:"test"}).success).toBe(true);
    expect(managerEmployeeSchema.safeParse({name:"N",email:"bad",password:"123"}).success).toBe(false);
  });
});

describe("entrySchema",()=>{
  it("accepts time with only a date and hours",()=>{
    const result=entrySchema.parse({timesheetId:"sheet-1",date:"2026-08-31",hours:"7.5"});
    expect(result.hours).toBe(7.5);
  });
});
