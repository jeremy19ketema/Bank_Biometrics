-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterEnum
ALTER TYPE "AuditCategory" ADD VALUE 'POLICY_CHANGE';

-- AlterEnum
ALTER TYPE "BranchStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "regionId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "departmentId" TEXT;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPermission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCustomRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customRoleId" TEXT NOT NULL,
    "scopeType" TEXT,
    "scopeId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    CONSTRAINT "UserCustomRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalSecurityPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mfaRequired" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "passwordRegex" TEXT NOT NULL DEFAULT '^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$',
    "maxFailedAttempts" INTEGER NOT NULL DEFAULT 5,
    "accountLockoutMinutes" INTEGER NOT NULL DEFAULT 15,
    "ipRestrictions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalSecurityPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requireMultiFinger" BOOLEAN NOT NULL DEFAULT false,
    "retentionDays" INTEGER NOT NULL DEFAULT 365,
    "strictMatchThreshold" DOUBLE PRECISION NOT NULL DEFAULT 85.0,
    "allowReEnrollment" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiometricPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemIntegration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "endpoint" TEXT,
    "apiKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAlert" (
    "id" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceIp" TEXT,
    "targetUserId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomPermissionToCustomRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomPermissionToCustomRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_code_key" ON "CostCenter"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomRole_name_key" ON "CustomRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomPermission_name_key" ON "CustomPermission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalSecurityPolicy_name_key" ON "GlobalSecurityPolicy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BiometricPolicy_name_key" ON "BiometricPolicy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SystemIntegration_name_key" ON "SystemIntegration"("name");

-- CreateIndex
CREATE INDEX "_CustomPermissionToCustomRole_B_index" ON "_CustomPermissionToCustomRole"("B");

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCustomRole" ADD CONSTRAINT "UserCustomRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCustomRole" ADD CONSTRAINT "UserCustomRole_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "CustomRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomPermissionToCustomRole" ADD CONSTRAINT "_CustomPermissionToCustomRole_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomPermissionToCustomRole" ADD CONSTRAINT "_CustomPermissionToCustomRole_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
