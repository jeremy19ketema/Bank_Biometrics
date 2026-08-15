"use client";

export type UserRole = "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER" | "SUPER_ADMIN_IT" | "SUPER_ADMIN_FOREX" | "BANK_MANAGER" | "BRANCH_IT" | "ACCOUNTANT" | "HR";

export type StaffStatus = "PENDING_APPROVAL" | "PENDING_FIRST_LOGIN" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED" | "DISABLED" | "ON_LEAVE";

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  department?: string;
  avatarUrl?: string;
  isFirstLogin?: boolean;
  status?: StaffStatus;
}

// Role-based route mappings
export const ROLE_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin",
  SUPER_ADMIN_MANAGER: "/internal-manager",
  SUPER_ADMIN_IT: "/it",
  SUPER_ADMIN_FOREX: "/forex",
  BANK_MANAGER: "/manager",
  BRANCH_IT: "/it",
  ACCOUNTANT: "/accountant",
  HR: "/hr-dash",
};

// Role-based accessible route prefixes
export const ROLE_ACCESS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    "/super-admin", "/branches", "/managers", "/accountants", "/reports",
    "/governance", "/settings", "/transactions", "/it-users", "/forex",
    "/approvals", "/branch-it", "/hr-dash"
  ],
  SUPER_ADMIN_MANAGER: [
    "/internal-manager", "/it", "/forex", "/it-users", "/reports",
    "/settings", "/approvals", "/transactions", "/hr-dash"
  ],
  SUPER_ADMIN_IT: [
    "/it", "/it-users", "/settings", "/reports", "/biometrics"
  ],
  SUPER_ADMIN_FOREX: [
    "/forex", "/transactions", "/customers", "/reports"
  ],
  BANK_MANAGER: [
    "/manager", "/accountants", "/transactions", "/customers",
    "/biometrics", "/reports", "/approvals"
  ],
  BRANCH_IT: [
    "/it", "/settings", "/reports"
  ],
  ACCOUNTANT: [
    "/accountant", "/transactions", "/customers", "/biometrics"
  ],
  HR: [
    "/hr-dash", "/users", "/approvals", "/reports"
  ]
};

export function hasAccess(role: UserRole, pathname: string): boolean {
  const allowedPrefixes = ROLE_ACCESS[role];
  return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export function getDashboardRoute(role: UserRole): string {
  return ROLE_ROUTES[role];
}

export function isSuperAdminRole(role: UserRole): boolean {
  return ["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN_IT", "SUPER_ADMIN_FOREX"].includes(role);
}

export function isBranchRole(role: UserRole): boolean {
  return ["BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT"].includes(role);
}

const AUTH_USER_KEY = "aegis_user";

// The server owns the HttpOnly authentication cookie. This session-only value
// is display state, never authorization state.
export function setAuthSession(user: AuthUser): void {
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredUser();
}

export function isFirstLoginUser(): boolean {
  const user = getStoredUser();
  return user?.isFirstLogin === true;
}


