export type UserRole =
  | "SUPER_ADMIN"
  | "SUPER_ADMIN_MANAGER"
  | "SUPER_ADMIN_IT"
  | "SUPER_ADMIN_FOREX"
  | "BANK_MANAGER"
  | "BRANCH_IT"
  | "ACCOUNTANT"
  | "HR";

export type StaffStatus =
  | "PENDING_APPROVAL"
  | "PENDING_FIRST_LOGIN"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "LOCKED"
  | "DISABLED"
  | "ON_LEAVE";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  avatarUrl?: string;
  isActive: boolean;
  isFirstLogin?: boolean;
  status: StaffStatus;
  lastLoginAt?: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  requestType: string;
  requestedById: string;
  requestedByName: string;
  targetUserId?: string;
  targetRole?: UserRole;
  targetBranchId?: string;
  details: string;
  status: ApprovalStatus;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | string;
  approvedById?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  requestedBy?: {
    id: string;
    fullName: string;
    username: string;
    role: UserRole;
  };
  approvedBy?: {
    id: string;
    fullName: string;
    username: string;
  };
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  category: "BRANCH" | "STAFF" | "TRANSACTION" | "BIOMETRIC" | "GOVERNANCE" | "REPORTS";
  description: string;
}

export interface Role {
  id: string;
  name: string;
  code: UserRole;
  description: string;
  permissions: string[]; // Permission IDs
  userCount: number;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  managerName?: string;
  tellerCount: number;
  dailyTransactionLimit: number;
  createdAt: string;
}

export interface BankManager {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: string;
  branchName: string;
  status: StaffStatus;
  isFirstLogin?: boolean;
  assignedDate: string;
}

export interface Accountant {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: string;
  branchName: string;
  tillNumber: string;
  status: StaffStatus;
  isFirstLogin?: boolean;
  isActive: boolean;
  dailyProcessedVolume: number;
  verificationSuccessRate: number;
}

export interface Customer {
  id: string;
  accountNumber: string;
  fullName: string;
  nationalId: string;
  phone: string;
  email: string;
  accountType: "SAVINGS" | "CHECKING" | "CORPORATE";
  balance: number;
  isBiometricEnrolled: boolean;
  enrolledFingerprints: string[];
  status: "ACTIVE" | "FLAGGED" | "FROZEN";
  createdAt: string;
}

export interface BiometricScanResult {
  scanId: string;
  customerId?: string;
  customerName?: string;
  matchScore: number; // 0 - 100
  isMatch: boolean;
  fingerIndex: string;
  qualityScore: number;
  scannedAt: string;
  deviceId: string;
  operatorId: string;
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  accountNumber: string;
  customerName: string;
  type: "CASH_WITHDRAWAL" | "CHEQUE_DEPOSIT" | "CHEQUE_CLEARANCE" | "TRANSFER";
  amount: number;
  status: "PENDING_APPROVAL" | "COMPLETED" | "REJECTED" | "FLAGGED";
  biometricVerified: boolean;
  accountantId: string;
  accountantName: string;
  branchId: string;
  approvedBy?: string;
  timestamp: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  category: "SECURITY" | "TRANSACTION" | "BIOMETRIC" | "ADMINISTRATION";
  ipAddress: string;
  details: string;
  status: "SUCCESS" | "WARNING" | "FAILURE";
}

