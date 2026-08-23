import { AuthUser } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  status: number;
}

export function getApiUrl(): string {
  return API_URL;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function clearSessionAndRedirect(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("aegis_user");
  localStorage.removeItem("token");
  window.location.href = "/login";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {})
      }
    });
  } catch {
    return { success: false, status: 0, message: "Cannot reach the backend. Make sure the API server is running." };
  }

  const payload = await response.json().catch(() => null);

  // Expired/invalid session — force re-login
  if ((response.status === 401 || response.status === 403) && payload?.message?.toLowerCase().includes("token")) {
    clearSessionAndRedirect();
    return { success: false, status: response.status, message: payload?.message || "Session expired" };
  }

  if (!response.ok) {
    return { success: false, status: response.status, message: payload?.message || `Request failed (${response.status})` };
  }

  return {
    success: payload?.success !== false,
    data: payload?.data,
    message: payload?.message,
    status: response.status
  };
}

export function apiGet<T>(path: string): Promise<ApiResult<T>> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

// ──────────────────────────────────────────────
// Session helpers
// ──────────────────────────────────────────────

export function getSessionUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("aegis_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Domain helpers
// ──────────────────────────────────────────────

export const bankApi = {
  accountants: () => apiGet<any[]>("/staff/accountants"),

  staffDetails: (id: string) => apiGet<any>(`/staff/${id}`),

  updateStaff: (id: string, payload: { fullName?: string; email?: string; status?: string; isActive?: boolean }) =>
    apiPut<any>(`/staff/${id}`, payload),

  createAccountant: (payload: { username: string; fullName: string; email: string; passcode: string; branchId?: string }) =>
    apiPost<any>("/staff/accountant", payload),

  branches: () => apiGet<any[]>("/branches"),

  transactions: (filters?: { status?: string; type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.type) params.set("type", filters.type);
    const qs = params.toString();
    return apiGet<any[]>(`/transactions/history${qs ? `?${qs}` : ""}`);
  },

  createTransaction: (payload: { accountNumber: string; amount: number; type: string; biometricVerified: boolean }) =>
    apiPost<any>("/transactions", payload),

  approveTransaction: (id: string, decision: "APPROVED" | "REJECTED") =>
    apiPost<any>(`/transactions/${id}/approve`, { decision }),

  customers: (query?: string) => apiGet<any[]>(`/customers${query ? `?query=${encodeURIComponent(query)}` : ""}`),

  customer: (id: string) => apiGet<any>(`/customers/${id}`),

  auditLogs: (filters?: { category?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    return apiGet<any[]>(`/audit/logs${qs ? `?${qs}` : ""}`);
  },

  auditMetrics: () => apiGet<any>("/audit/metrics"),

  pendingApprovals: (branchId?: string) =>
    apiGet<any[]>(`/approvals/pending${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ""}`)
};
