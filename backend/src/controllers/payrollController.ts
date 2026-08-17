import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

// Helper to compile payroll data
async function generatePayrollData(branchId: string | null | undefined, startDateStr: string, endDateStr: string) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  let userWhere: any = {};
  if (branchId) {
    userWhere.branchId = branchId;
  }

  const users = await prisma.user.findMany({
    where: userWhere,
    include: {
      attendanceEvents: {
        where: { deviceTimestamp: { gte: startDate, lte: endDate } }
      },
      leaveRequestsRequested: {
        where: {
          status: "APPROVED",
          startDate: { lte: endDate },
          endDate: { gte: startDate }
        }
      },
      overtimeRequestsRequested: {
        where: {
          status: "APPROVED",
          date: { gte: startDate, lte: endDate }
        }
      }
    }
  });

  return users.map(user => {
    const totalClockIns = user.attendanceEvents.filter(e => e.type === "IN").length;
    const totalClockOuts = user.attendanceEvents.filter(e => e.type === "OUT").length;
    const totalOvertimeHours = user.overtimeRequestsRequested.reduce((sum, req) => sum + req.hours, 0);
    const approvedLeaveDays = user.leaveRequestsRequested.reduce((sum, req) => {
      // Calculate overlap with report window
      const start = new Date(Math.max(req.startDate.getTime(), startDate.getTime()));
      const end = new Date(Math.min(req.endDate.getTime(), endDate.getTime()));
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return sum + diffDays;
    }, 0);

    return {
      userId: user.id,
      fullName: user.fullName,
      username: user.username,
      branchId: user.branchId,
      totalClockIns,
      totalClockOuts,
      totalOvertimeHours,
      approvedLeaveDays
    };
  });
}

// Generate JSON Payroll Report
export async function getPayrollReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const ipAddress = req.ip || "unknown";

  if (!req.user || !startDate || !endDate) {
    res.status(400).json({ success: false, message: "Missing startDate or endDate query parameters" });
    return;
  }

  try {
    let scopeBranchId = undefined;
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      scopeBranchId = req.user.branchId;
    }

    const data = await generatePayrollData(scopeBranchId, startDate as string, endDate as string);

    await logAuditEvent(req.user.id, "PAYROLL_REPORT_GENERATED", "ADMINISTRATION", ipAddress, `Generated JSON payroll report from ${startDate} to ${endDate}`, "SUCCESS");

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to generate payroll report" });
  }
}

// Generate CSV Payroll Report
export async function getPayrollReportCSV(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const ipAddress = req.ip || "unknown";

  if (!req.user || !startDate || !endDate) {
    res.status(400).json({ success: false, message: "Missing startDate or endDate query parameters" });
    return;
  }

  try {
    let scopeBranchId = undefined;
    if (req.user.role === "HR" || req.user.role === "BANK_MANAGER") {
      scopeBranchId = req.user.branchId;
    }

    const data = await generatePayrollData(scopeBranchId, startDate as string, endDate as string);

    let csvContent = "User ID,Full Name,Username,Branch ID,Total Clock Ins,Total Clock Outs,Overtime Hours,Approved Leave Days\n";
    
    data.forEach(row => {
      csvContent += `${row.userId},"${row.fullName}",${row.username},${row.branchId || ''},${row.totalClockIns},${row.totalClockOuts},${row.totalOvertimeHours},${row.approvedLeaveDays}\n`;
    });

    await logAuditEvent(req.user.id, "PAYROLL_CSV_EXPORTED", "ADMINISTRATION", ipAddress, `Exported CSV payroll report from ${startDate} to ${endDate}`, "SUCCESS");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=payroll_${startDate}_${endDate}.csv`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to generate CSV" });
  }
}
