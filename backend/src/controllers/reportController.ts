import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// Helper to escape CSV formulas
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@")) {
    return `'${str}`; // Prefix with single quote to prevent formula execution in Excel
  }
  // Escape quotes
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function getDashboardMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { role, branchId } = req.user;
    
    // Determine the scope filter
    const branchFilter = branchId ? { branchId } : {};

    let metrics: any = {};

    // Build metrics dynamically based on effective role and scope
    // SUPER_ADMIN, SUPER_ADMIN_MANAGER, AUDITOR, and BANK_MANAGER care about users/staffing
    if (["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN_HR", "AUDITOR", "BANK_MANAGER", "HR"].includes(role)) {
      metrics.totalStaff = await prisma.user.count({ where: branchFilter });
      metrics.activeStaff = await prisma.user.count({ where: { ...branchFilter, status: "ACTIVE" } });
    }

    // IT and Devices
    if (["SUPER_ADMIN", "SUPER_ADMIN_IT", "AUDITOR", "BRANCH_IT", "BANK_MANAGER"].includes(role)) {
      metrics.totalDevices = await prisma.biometricDevice.count({ where: branchFilter });
      metrics.onlineDevices = await prisma.biometricDevice.count({ where: { ...branchFilter, status: "ONLINE" } });
    }

    // Transactions and Approvals
    if (["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "AUDITOR", "BANK_MANAGER", "ACCOUNTANT"].includes(role)) {
      // For transactions, we need to filter by the branch of the transaction
      const txBranchFilter = branchId ? { branchId } : {};
      metrics.totalTransactions = await prisma.transaction.count({ where: txBranchFilter });
      metrics.pendingApprovals = await prisma.transaction.count({ where: { ...txBranchFilter, status: "PENDING_APPROVAL" } });
    }

    // Attendance
    if (["SUPER_ADMIN", "SUPER_ADMIN_HR", "AUDITOR", "HR", "ACCOUNTANT"].includes(role)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const userFilter = branchId ? { user: { branchId } } : {};
      
      metrics.todayClockIns = await prisma.attendanceEvent.count({
        where: {
          ...userFilter,
          type: "IN",
          deviceTimestamp: { gte: today }
        }
      });
      
      metrics.pendingLeaveRequests = await prisma.leaveRequest.count({
        where: { ...userFilter, status: "PENDING" }
      });
    }

    // Security and Compliance (Auditor / Super Admin)
    if (["SUPER_ADMIN", "AUDITOR"].includes(role)) {
      metrics.securityAlerts = await prisma.systemAuditLog.count({
        where: { category: "SECURITY", status: { in: ["FAILURE", "WARNING"] } }
      });
    }

    res.status(200).json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch dashboard metrics" });
  }
}

export async function requestReportExport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Auditor can export, but only what is in their scope
    // Wait, requirement: "An Auditor must never ... export unrestricted data".
    // This means Auditor is allowed to export data restricted by their scope (which applies to everyone anyway)
    // Wait, "export unrestricted data" -> they can export data filtered by their scope.
    const { type, startDate, endDate } = req.body;

    if (!type) {
      res.status(400).json({ success: false, message: "Report type is required" });
      return;
    }

    // Create a ReportExportJob instead of doing it synchronously
    const job = await prisma.reportExportJob.create({
      data: {
        requestedBy: req.user.id,
        type,
        filters: JSON.stringify({ startDate, endDate, scopeBranchId: req.user.branchId }),
        status: "PENDING"
      }
    });

    await logAuditEvent(req.user.id, "REPORT_EXPORT_REQUESTED", "ADMINISTRATION", req.ip || "unknown", `Requested async export job ${job.id} for type ${type}`, "SUCCESS");

    // In a real app, this would push to a message queue. We'll simulate async processing here.
    processExportJob(job.id, req.user);

    res.status(202).json({ success: true, message: "Export job started", data: { jobId: job.id } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to request report export" });
  }
}

// Background processor simulation
async function processExportJob(jobId: string, user: any) {
  try {
    await prisma.reportExportJob.update({ where: { id: jobId }, data: { status: "PROCESSING" } });
    
    const job = await prisma.reportExportJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    const filters = JSON.parse(job.filters);
    let data: any[] = [];
    let csvString = "";

    // Simulated data fetching (In a real app, use pagination/streams to prevent memory exhaustion)
    if (job.type === "TRANSACTIONS") {
      const filter = filters.scopeBranchId ? { branchId: filters.scopeBranchId } : {};
      data = await prisma.transaction.findMany({
        where: filter,
        select: { id: true, amount: true, currency: true, status: true, accountantId: true, timestamp: true },
        take: 5000 // Limit for safety
      });
      
      csvString = "ID,Amount,Currency,Status,AccountantID,Timestamp\n" + data.map(d => 
        [d.id, d.amount, d.currency, d.status, d.accountantId, d.timestamp.toISOString()].map(escapeCsvValue).join(",")
      ).join("\n");
      
    } else if (job.type === "ATTENDANCE") {
      const filter = filters.scopeBranchId ? { user: { branchId: filters.scopeBranchId } } : {};
      data = await prisma.attendanceEvent.findMany({
        where: filter,
        select: { id: true, type: true, deviceTimestamp: true, userId: true },
        take: 5000
      });

      csvString = "ID,Type,DeviceTimestamp,UserID\n" + data.map(d => 
        [d.id, d.type, d.deviceTimestamp.toISOString(), d.userId].map(escapeCsvValue).join(",")
      ).join("\n");
    } else {
      throw new Error(`Unsupported report type: ${job.type}`);
    }

    // In a real app, write csvString to AWS S3 / Blob Storage and get a secure URL
    // For this demonstration, we'll store a mock URL since we don't have an S3 bucket configured
    const mockDownloadUrl = `/api/reports/download/${jobId}`;

    await prisma.reportExportJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        rowCount: data.length,
        downloadUrl: mockDownloadUrl,
        completedAt: new Date()
      }
    });

    await logAuditEvent(user.id, "REPORT_EXPORT_COMPLETED", "ADMINISTRATION", "system", `Export job ${jobId} completed with ${data.length} rows`, "SUCCESS");

  } catch (error: any) {
    await prisma.reportExportJob.update({
      where: { id: jobId },
      data: { status: "FAILED", errorMessage: error.message, completedAt: new Date() }
    });
    await logAuditEvent(user.id, "REPORT_EXPORT_FAILED", "ADMINISTRATION", "system", `Export job ${jobId} failed: ${error.message}`, "FAILURE");
  }
}

export async function getExportJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) return;
    const jobs = await prisma.reportExportJob.findMany({
      where: { requestedBy: req.user.id },
      orderBy: { requestedAt: "desc" },
      take: 10
    });
    res.status(200).json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
