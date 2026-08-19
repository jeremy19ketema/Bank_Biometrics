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
    passcode: string;
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
      // Need to dynamically import to avoid circular dep issues in Zustand if any, or just use fetch with env var
      // But we can just use the standard apiClient
      const { apiClient } = await import('@/services/apiClient');
      
      const payload = { ...data, password: data.passcode };
      delete (payload as any).passcode;

      const res = await apiClient.post<any>("/api/users", payload);

      if (!res.data?.success) throw new Error(res.data?.message);
      
      set({ loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));
