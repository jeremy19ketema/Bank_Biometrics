-- CreateEnum
CREATE TYPE "BiometricProviderType" AS ENUM ('MOCK', 'HARDWARE');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'UNASSIGNED', 'REPAIR', 'RETIRED');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('SICK', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'UNPAID');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'FAILED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'AUDITOR';

-- AlterTable
ALTER TABLE "BiometricScanResult" ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "livenessScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "providerType" "BiometricProviderType" NOT NULL DEFAULT 'MOCK',
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "transactionRef" TEXT;

-- AlterTable
ALTER TABLE "SecurityAlert" ADD COLUMN     "acknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "escalationLevel" TEXT NOT NULL DEFAULT 'TIER_1';

-- AlterTable
ALTER TABLE "SystemAuditLog" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "severity" "AlertSeverity" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "targetId" TEXT,
ADD COLUMN     "targetType" TEXT;

-- AlterTable
ALTER TABLE "SystemIntegration" DROP COLUMN "apiKey",
ADD COLUMN     "authTag" TEXT,
ADD COLUMN     "encryptedKey" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "iv" TEXT,
ADD COLUMN     "secretKeyVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "biometricScanId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'ETB';

-- CreateTable
CREATE TABLE "SystemBackup" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sizeBytes" BIGINT,
    "path" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastRestoreTest" TIMESTAMP(3),
    "restoreStatus" TEXT,

    CONSTRAINT "SystemBackup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceWindow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdById" TEXT NOT NULL,

    CONSTRAINT "MaintenanceWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricDevice" (
    "id" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "ipAddress" TEXT,
    "name" TEXT NOT NULL,
    "secretKeyHash" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'UNASSIGNED',
    "branchId" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "firmwareVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiometricDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffBiometricConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "captureMethod" TEXT NOT NULL,
    "documentReference" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "signedTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffBiometricConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceEvent" (
    "id" TEXT NOT NULL,
    "deviceEventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "type" "AttendanceType" NOT NULL,
    "deviceTimestamp" TIMESTAMP(3) NOT NULL,
    "receivedTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "source" TEXT NOT NULL DEFAULT 'DEVICE',

    CONSTRAINT "AttendanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceAdjustment" (
    "id" TEXT NOT NULL,
    "attendanceEventId" TEXT NOT NULL,
    "adjustedTimestamp" TIMESTAMP(3) NOT NULL,
    "adjustedType" "AttendanceType" NOT NULL,
    "reason" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "LeaveType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerBiometricConsent" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "documentReference" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "captureMetadata" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "signedTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerBiometricConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionPolicy" (
    "id" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "currency" TEXT NOT NULL,
    "requiresBiometrics" BOOLEAN NOT NULL DEFAULT false,
    "makerCheckerThreshold" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportExportJob" (
    "id" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "downloadUrl" TEXT,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ReportExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCourse" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "mandatoryRoles" "Role"[],
    "mandatoryDepartments" TEXT[],
    "validityMonths" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffComplianceRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completionDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "documentReference" TEXT,
    "verifierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffComplianceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "BiometricDevice_macAddress_key" ON "BiometricDevice"("macAddress");

-- CreateIndex
CREATE UNIQUE INDEX "StaffBiometricConsent_userId_key" ON "StaffBiometricConsent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceEvent_deviceEventId_key" ON "AttendanceEvent"("deviceEventId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerBiometricConsent_customerId_key" ON "CustomerBiometricConsent"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionPolicy_transactionType_currency_key" ON "TransactionPolicy"("transactionType", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceCourse_code_key" ON "ComplianceCourse"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_biometricScanId_key" ON "Transaction"("biometricScanId");

-- AddForeignKey
ALTER TABLE "MaintenanceWindow" ADD CONSTRAINT "MaintenanceWindow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAlert" ADD CONSTRAINT "SecurityAlert_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiometricScanResult" ADD CONSTRAINT "BiometricScanResult_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "BiometricDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_biometricScanId_fkey" FOREIGN KEY ("biometricScanId") REFERENCES "BiometricScanResult"("scanId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiometricDevice" ADD CONSTRAINT "BiometricDevice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffBiometricConsent" ADD CONSTRAINT "StaffBiometricConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceEvent" ADD CONSTRAINT "AttendanceEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceEvent" ADD CONSTRAINT "AttendanceEvent_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "BiometricDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceAdjustment" ADD CONSTRAINT "AttendanceAdjustment_attendanceEventId_fkey" FOREIGN KEY ("attendanceEventId") REFERENCES "AttendanceEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceAdjustment" ADD CONSTRAINT "AttendanceAdjustment_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceAdjustment" ADD CONSTRAINT "AttendanceAdjustment_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRequest" ADD CONSTRAINT "OvertimeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRequest" ADD CONSTRAINT "OvertimeRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBiometricConsent" ADD CONSTRAINT "CustomerBiometricConsent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExportJob" ADD CONSTRAINT "ReportExportJob_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffComplianceRecord" ADD CONSTRAINT "StaffComplianceRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffComplianceRecord" ADD CONSTRAINT "StaffComplianceRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ComplianceCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffComplianceRecord" ADD CONSTRAINT "StaffComplianceRecord_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

