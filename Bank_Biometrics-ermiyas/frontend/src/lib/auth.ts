"use client";

type UserRole = "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER" | "SUPER_ADMIN_IT" | "SUPER_ADMIN_FOREX" | "BANK_MANAGER" | "HR" | "BRANCH_IT" | "IT_SUPPORT" | "ACCOUNTANT";

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
  status?: string;
}

// Role-based route mappings
export const ROLE_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: "/super-admin",
  SUPER_ADMIN_MANAGER: "/internal-manager",
  SUPER_ADMIN_IT: "/it",
  SUPER_ADMIN_FOREX: "/forex",
  BANK_MANAGER: "/manager",
  BRANCH_IT: "/it",
  IT_SUPPORT: "/it",
  HR: "/hr",
  ACCOUNTANT: "/accountant",
};

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
