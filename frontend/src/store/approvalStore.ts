import { create } from "zustand";
import { ApprovalRequest } from "@/types";
import { apiClient } from "@/services/apiClient";

interface ApprovalState {
  approvalRequests: ApprovalRequest[];
  pendingCount: number;
  loading: boolean;

  // Actions
  fetchPendingApprovals: (branchId?: string) => Promise<void>;
  fetchAllApprovals: (status?: string) => Promise<void>;
  createApprovalRequest: (request: {
    requestType: string;
    targetUserId?: string;
    targetRole?: string;
    targetBranchId?: string;
    details: string;
  }) => Promise<boolean>;
  approveRequest: (id: string) => Promise<boolean>;
  rejectRequest: (id: string, reason: string) => Promise<boolean>;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvalRequests: [],
  pendingCount: 0,
  loading: false,

  fetchPendingApprovals: async (branchId?: string) => {
    set({ loading: true });
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

  fetchAllApprovals: async (status?: string) => {
    set({ loading: true });
    try {
      const endpoint = status
        ? `/api/approvals/all?status=${status}`
        : "/api/approvals/all";
      const data = await apiClient.get<ApprovalRequest[]>(endpoint.replace("/api", ""));
      if (data.success) {
        set({ approvalRequests: data.data || [] });
      }
    } catch (error) {
      console.warn("Failed to fetch approvals:", error);
    } finally {
      set({ loading: false });
    }
  },

  createApprovalRequest: async (request) => {
    try {
      const data = await apiClient.post<ApprovalRequest>("/approvals", request);
      if (data.success) {
        // Refetch pending approvals
        await get().fetchPendingApprovals();
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Failed to create approval request:", error);
      return false;
    }
  },

  approveRequest: async (id) => {
    try {
      const data = await apiClient.put<ApprovalRequest>(`/approvals/${id}/approve`, {});
      if (data.success) {
        await get().fetchPendingApprovals();
        return true;
      }
      console.warn("Backend rejected approval:", data.message);
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
        await get().fetchPendingApprovals();
        return true;
      }
      console.warn("Backend rejected rejection:", data.message);
      return false;
    } catch (error) {
      console.warn("Failed to reject request:", error);
      return false;
    }
  },
}));

