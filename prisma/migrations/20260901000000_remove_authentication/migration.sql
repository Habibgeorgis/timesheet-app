ALTER TABLE "User" ADD COLUMN "employeeCode" TEXT;
ALTER TABLE "User" ADD COLUMN "jobTitle" TEXT;

UPDATE "User"
SET "employeeCode" = 'EMP-' || UPPER(SUBSTRING(MD5("id"), 1, 6)),
    "jobTitle" = COALESCE("department", 'Employee')
WHERE "role" = 'EMPLOYEE';

CREATE UNIQUE INDEX "User_employeeCode_key" ON "User"("employeeCode");

DROP TABLE "Session";
ALTER TABLE "User" DROP COLUMN "passwordHash";
