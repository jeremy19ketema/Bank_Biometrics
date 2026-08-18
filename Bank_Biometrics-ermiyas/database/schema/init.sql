-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'SUPER_ADMIN_MANAGER', 'SUPER_ADMIN_IT', 'SUPER_ADMIN_FOREX', 'BANK_MANAGER', 'BRANCH_IT', 'ACCOUNTANT');
CREATE TYPE "BranchStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
CREATE TYPE "StaffStatus" AS ENUM ('PENDING_APPROVAL', 'PENDING_FIRST_LOGIN', 'ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'INACTIVE', 'LOCKED', 'DISABLED');
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'FLAGGED', 'FROZEN');
CREATE TYPE "TransactionType" AS ENUM ('CASH_WITHDRAWAL', 'CHEQUE_DEPOSIT', 'CHEQUE_CLEARANCE', 'TRANSFER');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING_APPROVAL', 'COMPLETED', 'REJECTED', 'FLAGGED');
CREATE TYPE "AuditCategory" AS ENUM ('SECURITY', 'TRANSACTION', 'BIOMETRIC', 'ADMINISTRATION');
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'WARNING', 'FAILURE');

-- CreateTable Branch
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "BranchStatus" NOT NULL DEFAULT 'ACTIVE',
    "dailyTransactionLimit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "branchId" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "StaffStatus" NOT NULL DEFAULT 'PENDING_FIRST_LOGIN',
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Customer
CREATE TABLE "Customer" (
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
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable BiometricScanResult
CREATE TABLE "BiometricScanResult" (
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

-- CreateTable Transaction
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "biometricVerified" BOOLEAN NOT NULL DEFAULT false,
    "accountantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "approvedById" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable SystemAuditLog
CREATE TABLE "SystemAuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL,

    CONSTRAINT "SystemAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable ApprovalRequest
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetRole" "Role",
    "targetBranchId" TEXT,
    "details" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Customer_accountNumber_key" ON "Customer"("accountNumber");
CREATE UNIQUE INDEX "Customer_nationalId_key" ON "Customer"("nationalId");
CREATE UNIQUE INDEX "Transaction_referenceNumber_key" ON "Transaction"("referenceNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BiometricScanResult" ADD CONSTRAINT "BiometricScanResult_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BiometricScanResult" ADD CONSTRAINT "BiometricScanResult_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SystemAuditLog" ADD CONSTRAINT "SystemAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
