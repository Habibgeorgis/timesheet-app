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
  it("converts an hours-and-minutes duration into minutes",()=>{
    const result=entrySchema.parse({timesheetId:"sheet-1",date:"2026-08-31",duration:"7:30"});
    expect(result.duration).toBe(450);
  });

  it("accepts exact minute values and rejects invalid durations",()=>{
    expect(entrySchema.parse({timesheetId:"sheet-1",date:"2026-08-31",duration:"0:01"}).duration).toBe(1);
    expect(entrySchema.parse({timesheetId:"sheet-1",date:"2026-08-31",duration:"24:00"}).duration).toBe(1440);
    expect(entrySchema.safeParse({timesheetId:"sheet-1",date:"2026-08-31",duration:"7:75"}).success).toBe(false);
    expect(entrySchema.safeParse({timesheetId:"sheet-1",date:"2026-08-31",duration:"0:00"}).success).toBe(false);
  });
});
