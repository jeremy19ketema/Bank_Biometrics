import { create } from "zustand";

interface HRStoreState {
  stats: {
    totalUsersCreated: number;
    pendingApprovals: number;
    activeEmployees: number;
  };
  loading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
  createStaffRequest: (data: {
    username: string;
    fullName: string;
    email: string;
    role: string;
    branchId?: string;
    passcode?: string;
  }) => Promise<{ success: boolean; data?: any; message?: string }>;
}

export const useHRStore = create<HRStoreState>((set) => ({
  stats: {
    totalUsersCreated: 0,
    pendingApprovals: 0,
    activeEmployees: 0,
  },
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      // In a real scenario, this would be an API call to a specific HR dashboard stats endpoint.
      // For now, we mock the stats as requested.
      setTimeout(() => {
        set({
          stats: {
            totalUsersCreated: 42,
            pendingApprovals: 8,
            activeEmployees: 156,
          },
          loading: false,
        });
      }, 500);
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createStaffRequest: async (data) => {
    set({ loading: true, error: null });
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("aegis_auth_token="))
        ?.split("=")[1];

      const res = await fetch("http://localhost:5000/api/staff/hr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      set({ loading: false });
      return { success: true, data: result.data };
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.message };
    }
  },
}));
