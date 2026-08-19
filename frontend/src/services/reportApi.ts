import { apiClient } from "./apiClient";

export interface DashboardMetrics {
  totalStaff?: number;
  activeStaff?: number;
  totalDevices?: number;
  onlineDevices?: number;
  totalTransactions?: number;
  pendingApprovals?: number;
  todayClockIns?: number;
  pendingLeaveRequests?: number;
  securityAlerts?: number;
}

export interface ReportExportJob {
  id: string;
  type: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  downloadUrl?: string;
  rowCount: number;
  requestedAt: string;
  completedAt?: string;
}

export const reportApi = {
  getDashboardMetrics: async () => {
    return apiClient.get<DashboardMetrics>("/api/reports/dashboard");
  },
  
  requestExport: async (type: string, startDate?: string, endDate?: string) => {
    return apiClient.post<{ jobId: string }>("/api/reports/export", { type, startDate, endDate });
  },

  getExportJobs: async () => {
    return apiClient.get<ReportExportJob[]>("/api/reports/export/jobs");
  }
};
