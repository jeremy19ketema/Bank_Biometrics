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
    password: string;
  }) => Promise<boolean>;
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
      const { apiClient } = await import('@/services/apiClient');
      
      const res = await apiClient.post<any>("/api/users", data);

      if (!res.data?.success) throw new Error(res.data?.message);
      
      set({ loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));
