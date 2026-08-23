import { create } from "zustand";
import { ApprovalRequest } from "@/types";
import { apiClient } from "@/services/apiClient";

interface ApprovalState {
  approvalRequests: ApprovalRequest[];
  pendingCount: number;
  loading: boolean;
  lastBranchId?: string;

  // Actions
  fetchPendingApprovals: (branchId?: string) => Promise<void>;
  approveRequest: (id: string) => Promise<boolean>;
  rejectRequest: (id: string, reason: string) => Promise<boolean>;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvalRequests: [],
  pendingCount: 0,
  loading: false,

  fetchPendingApprovals: async (branchId?: string) => {
    set({ loading: true, lastBranchId: branchId });
    try {
      const endpoint = branchId
        ? `/api/approvals/pending?branchId=${branchId}`
        : "/api/approvals/pending";
      const data = await apiClient.get<ApprovalRequest[]>(endpoint.replace("/api", ""));
      if (data.success) {
        set({
          approvalRequests: data.data || [],
          pendingCount: (data.data || []).length,
        });
      }
    } catch (error) {
      console.warn("Failed to fetch pending approvals:", error);
    } finally {
      set({ loading: false });
    }
  },

  approveRequest: async (id) => {
    try {
      const data = await apiClient.put<ApprovalRequest>(`/approvals/${id}/approve`, {});
      if (data.success) {
        await get().fetchPendingApprovals(get().lastBranchId);
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Failed to approve request:", error);
      return false;
    }
  },

  rejectRequest: async (id, reason) => {
    try {
      const data = await apiClient.put<ApprovalRequest>(`/approvals/${id}/reject`, { rejectionReason: reason });
      if (data.success) {
        await get().fetchPendingApprovals(get().lastBranchId);
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Failed to reject request:", error);
      return false;
    }
  },
}));

