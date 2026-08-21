import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";

const VALID_STATUSES = ["PRESENT", "ABSENT", "LATE", "ON_LEAVE"];

function parseDateParam(value: any): Date | null {
  if (!value || typeof value !== "string") return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// GET /attendance?date=YYYY-MM-DD  (or ?from=&to= for a range)
export async function getAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const { date, from, to } = req.query;

    const where: any = {};

    if (date) {
      const dayStart = parseDateParam(date);
      if (!dayStart) {
        res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" });
        return;
      }
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      where.date = { gte: dayStart, lt: dayEnd };
    } else if (from || to) {
      where.date = {};
      const fromDate = parseDateParam(from);
      const toDate = parseDateParam(to);
      if (fromDate) where.date.gte = fromDate;
      if (toDate) {
        const toEnd = new Date(toDate!.getTime() + 24 * 60 * 60 * 1000);
        where.date.lt = toEnd;
      }
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            role: true,
            branchId: true,
            branch: { select: { id: true, name: true, code: true } }
          }
        },
        markedBy: { select: { id: true, username: true } }
      },
      orderBy: [{ date: "desc" }, { employee: { fullName: "asc" } }]
    });

    res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve attendance" });
  }
}

// POST /attendance/mark  { employeeId, date (YYYY-MM-DD), status, notes? }
export async function markAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { employeeId, date, status, notes } = req.body;

  if (!employeeId || !date || !status) {
    res.status(400).json({ success: false, message: "employeeId, date and status are required" });
    return;
  }

  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
    return;
  }

  const day = parseDateParam(date);
  if (!day) {
    res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" });
    return;
  }

  try {
    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }

    const record = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: day } },
      create: {
        employeeId,
        date: day,
        status,
        notes: notes || null,
        checkInAt: status === "PRESENT" || status === "LATE" ? new Date() : null,
        markedById: req.user.id
      },
      update: {
        status,
        notes: notes !== undefined ? notes : undefined,
        markedById: req.user.id
      },
      include: {
        employee: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
            branch: { select: { name: true, code: true } }
          }
        }
      }
    });

    await logAuditEvent(
      req.user.id,
      "ATTENDANCE_MARKED",
      "ADMINISTRATION",
      ipAddress,
      `Attendance for ${employee.fullName} on ${date} marked as ${status}`,
      "SUCCESS"
    );

    res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to mark attendance" });
  }
}

// GET /attendance/summary?from=YYYY-MM-DD&to=YYYY-MM-DD — per-employee counts
export async function getAttendanceSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const { from, to } = req.query;

    const toDate = parseDateParam(to) || new Date();
    const defaultFrom = new Date(toDate.getTime() - 29 * 24 * 60 * 60 * 1000);
    const fromDate = parseDateParam(from) || defaultFrom;

    const records = await prisma.attendance.findMany({
      where: {
        date: { gte: fromDate, lt: new Date(toDate.getTime() + 24 * 60 * 60 * 1000) }
      },
      select: { employeeId: true, status: true }
    });

    const employees = await prisma.user.findMany({
      select: { id: true, username: true, fullName: true, role: true }
    });

    const summary = employees.map((emp) => {
      const empRecords = records.filter((r) => r.employeeId === emp.id);
      return {
        employeeId: emp.id,
        username: emp.username,
        fullName: emp.fullName,
        role: emp.role,
        present: empRecords.filter((r) => r.status === "PRESENT").length,
        absent: empRecords.filter((r) => r.status === "ABSENT").length,
        late: empRecords.filter((r) => r.status === "LATE").length,
        onLeave: empRecords.filter((r) => r.status === "ON_LEAVE").length,
        totalMarked: empRecords.length
      };
    });

    res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to build attendance summary" });
  }
}
