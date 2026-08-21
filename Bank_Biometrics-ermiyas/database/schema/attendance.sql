DO $$ BEGIN
  CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
  "checkInAt" TIMESTAMP(3),
  "checkOutAt" TIMESTAMP(3),
  "notes" TEXT,
  "markedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_employeeId_date_key"
  ON "Attendance"("employeeId", "date");
