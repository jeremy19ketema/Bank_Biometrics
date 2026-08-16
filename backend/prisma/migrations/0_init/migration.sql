-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."AuditCategory" AS ENUM ('SECURITY', 'TRANSACTION', 'BIOMETRIC', 'ADMINISTRATION');

-- CreateEnum
CREATE TYPE "public"."AuditStatus" AS ENUM ('SUCCESS', 'WARNING', 'FAILURE');

-- CreateEnum
CREATE TYPE "public"."BranchStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'FLAGGED', 'FROZEN');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPER_ADMIN', 'SUPER_ADMIN_MANAGER', 'SUPER_ADMIN_IT', 'SUPER_ADMIN_FOREX', 'BANK_MANAGER', 'BRANCH_IT', 'ACCOUNTANT', 'HR');

-- CreateEnum
CREATE TYPE "public"."StaffStatus" AS ENUM ('PENDING_APPROVAL', 'PENDING_FIRST_LOGIN', 'ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'INACTIVE', 'LOCKED', 'DISABLED');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING_APPROVAL', 'COMPLETED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('CASH_WITHDRAWAL', 'CHEQUE_DEPOSIT', 'CHEQUE_CLEARANCE', 'TRANSFER');

-- CreateTable
CREATE TABLE "public"."ApprovalRequest" (
    "id" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetRole" "public"."Role",
    "targetBranchId" TEXT,
    "details" TEXT NOT NULL,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BiometricScanResult" (
    "scanId" TEXT NOT NULL,
    "customerId" TEXT,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "isMatch" BOOLEAN NOT NULL,
    "fingerIndex" TEXT NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,

    CONSTRAINT "BiometricScanResult_pkey" PRIMARY KEY ("scanId")
);

-- CreateTable
CREATE TABLE "public"."Branch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "public"."BranchStatus" NOT NULL DEFAULT 'ACTIVE',
    "dailyTransactionLimit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "isBiometricEnrolled" BOOLEAN NOT NULL DEFAULT false,
    "enrolledFingerprints" TEXT[],
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemAuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" "public"."AuditCategory" NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" "public"."AuditStatus" NOT NULL,

    CONSTRAINT "SystemAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "biometricVerified" BOOLEAN NOT NULL DEFAULT false,
    "accountantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "approvedById" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "branchId" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."StaffStatus" NOT NULL DEFAULT 'PENDING_FIRST_LOGIN',
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "department" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "public"."Branch"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_accountNumber_key" ON "public"."Customer"("accountNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_nationalId_key" ON "public"."Customer"("nationalId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_referenceNumber_key" ON "public"."Transaction"("referenceNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username" ASC);

-- AddForeignKey
ALTER TABLE "public"."ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BiometricScanResult" ADD CONSTRAINT "BiometricScanResult_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BiometricScanResult" ADD CONSTRAINT "BiometricScanResult_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SystemAuditLog" ADD CONSTRAINT "SystemAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

