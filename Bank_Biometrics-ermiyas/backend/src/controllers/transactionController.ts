import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";
import { TransactionType, TransactionStatus } from "@prisma/client";

const VALID_TYPES: string[] = ["CASH_WITHDRAWAL", "CHEQUE_DEPOSIT", "CHEQUE_CLEARANCE", "TRANSFER"];
const HIGH_VALUE_THRESHOLD = 50000;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function createTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { accountNumber, amount, type, biometricVerified } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!accountNumber || amount === undefined || !type) {
    res.status(400).json({ success: false, message: "Missing accountNumber, amount, or type" });
    return;
  }

  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ success: false, message: `Invalid transaction type. Allowed: ${VALID_TYPES.join(", ")}` });
    return;
  }

  if (!req.user.branchId) {
    res.status(400).json({ success: false, message: "Your account is not assigned to a branch. Contact your administrator." });
    return;
  }

  const numericAmount = parseFloat(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ success: false, message: "Transaction amount must be a positive number" });
    return;
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { accountNumber } });
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer account not found" });
      return;
    }

    if (customer.status !== "ACTIVE") {
      res.status(400).json({ success: false, message: `Customer account is currently ${customer.status}` });
      return;
    }

    const branch = await prisma.branch.findUnique({
      where: { id: req.user.branchId }
    });

    if (!branch || branch.status !== "ACTIVE") {
      res.status(400).json({ success: false, message: "Your assigned branch is not active" });
      return;
    }

    // Enforce the branch daily transaction limit
    const todaysAggregate = await prisma.transaction.aggregate({
      where: {
        branchId: req.user.branchId,
        timestamp: { gte: startOfToday() },
        status: { in: ["COMPLETED", "PENDING_APPROVAL"] }
      },
      _sum: { amount: true }
    });

    const volumeToday = todaysAggregate._sum.amount || 0;
    if (volumeToday + numericAmount > branch.dailyTransactionLimit) {
      res.status(400).json({
        success: false,
        message: `Branch daily transaction limit exceeded. Limit: ${branch.dailyTransactionLimit}. Used today: ${volumeToday}.`
      });
      return;
    }

    const requiresApproval = numericAmount > HIGH_VALUE_THRESHOLD || !biometricVerified;
    const transactionStatus: TransactionStatus = requiresApproval ? "PENDING_APPROVAL" : "COMPLETED";

    const referenceNumber = `TX-${Date.now().toString().substring(5)}-${Math.floor(100 + Math.random() * 900)}`;

    // Balance movement + ledger entry must be atomic
    const transaction = await prisma.$transaction(async (tx) => {
      if (transactionStatus === "COMPLETED") {
        if (type === "CASH_WITHDRAWAL" || type === "TRANSFER") {
          if (customer.balance < numericAmount) {
            throw new Error("Insufficient account balance");
          }
          await tx.customer.update({
            where: { id: customer.id },
            data: { balance: customer.balance - numericAmount }
          });
        } else if (type === "CHEQUE_DEPOSIT") {
          await tx.customer.update({
            where: { id: customer.id },
            data: { balance: customer.balance + numericAmount }
          });
        }
      }

      return tx.transaction.create({
        data: {
          referenceNumber,
          accountNumber,
          customerName: customer.fullName,
          type: type as TransactionType,
          amount: numericAmount,
          status: transactionStatus,
          biometricVerified: !!biometricVerified,
          accountantId: req.user!.id,
          branchId: req.user!.branchId!
        }
      });
    }).catch((err: Error & { code?: string }) => {
      res.status(400).json({ success: false, message: err.message || "Failed to create transaction" });
      return null;
    });

    if (!transaction) return;

    await logAuditEvent(
      req.user.id,
      "TRANSACTION_CREATE",
      "TRANSACTION",
      ipAddress,
      `Initiated transaction ${referenceNumber} (${type}) for customer: ${customer.fullName}. Amount: ${numericAmount}. Status: ${transactionStatus}. Biometric Verified: ${!!biometricVerified}`,
      transactionStatus === "COMPLETED" ? "SUCCESS" : "WARNING"
    );

    res.status(201).json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create transaction" });
  }
}

export async function getTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { status, type } = req.query;

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const whereClause: Record<string, unknown> = {
      status: status ? (status as TransactionStatus) : undefined,
      type: type ? (type as TransactionType) : undefined
    };

    // Branch-scoped roles only see their own branch's ledger
    if (req.user.role === "BANK_MANAGER" || req.user.role === "BRANCH_IT" || req.user.role === "ACCOUNTANT") {
      whereClause.branchId = req.user.branchId;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        accountant: { select: { fullName: true } },
        approvedBy: { select: { fullName: true } }
      },
      orderBy: { timestamp: "desc" }
    });

    const formatted = transactions.map(t => ({
      id: t.id,
      referenceNumber: t.referenceNumber,
      accountNumber: t.accountNumber,
      customerName: t.customerName,
      type: t.type,
      amount: t.amount,
      status: t.status,
      biometricVerified: t.biometricVerified,
      accountantId: t.accountantId,
      accountantName: t.accountant.fullName,
      branchId: t.branchId,
      approvedBy: t.approvedBy?.fullName || null,
      timestamp: t.timestamp
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve transaction history" });
  }
}

export async function approveTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { decision } = req.body; // e.g., "APPROVED" or "REJECTED"
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) {
      res.status(404).json({ success: false, message: "Transaction not found" });
      return;
    }

    // Bank Managers can only authorize transactions from their own branch
    if (req.user.role === "BANK_MANAGER" && tx.branchId !== req.user.branchId) {
      res.status(403).json({ success: false, message: "Access denied: you can only authorize transactions for your assigned branch" });
      return;
    }

    if (tx.status !== "PENDING_APPROVAL") {
      res.status(400).json({ success: false, message: `Transaction has already been finalized: ${tx.status}` });
      return;
    }

    const nextStatus: TransactionStatus = decision === "APPROVED" ? "COMPLETED" : "REJECTED";

    let updated;
    if (nextStatus === "COMPLETED") {
      updated = await prisma.$transaction(async (prismaTx) => {
        const customer = await prismaTx.customer.findUnique({ where: { accountNumber: tx.accountNumber } });
        if (!customer) {
          throw new Error("Customer account not found");
        }

        // Deduct balance now since it was pending before
        if (tx.type === "CASH_WITHDRAWAL" || tx.type === "TRANSFER") {
          if (customer.balance < tx.amount) {
            throw new Error("Insufficient account balance to authorize payout");
          }
          await prismaTx.customer.update({
            where: { id: customer.id },
            data: { balance: customer.balance - tx.amount }
          });
        } else if (tx.type === "CHEQUE_DEPOSIT") {
          await prismaTx.customer.update({
            where: { id: customer.id },
            data: { balance: customer.balance + tx.amount }
          });
        }

        return prismaTx.transaction.update({
          where: { id },
          data: {
            status: nextStatus,
            approvedById: req.user!.id
          }
        });
      }).catch((err: Error & { code?: string }) => {
        res.status(400).json({ success: false, message: err.message || "Authorization failed" });
        return null;
      });

      if (!updated) return;
    } else {
      updated = await prisma.transaction.update({
        where: { id },
        data: {
          status: nextStatus,
          approvedById: req.user.id
        }
      });
    }

    await logAuditEvent(
      req.user.id,
      "TRANSACTION_AUTHORIZATION",
      "TRANSACTION",
      ipAddress,
      `Manager authorized decision ${decision} on transaction ${tx.referenceNumber}. Amount: ${tx.amount}`,
      nextStatus === "COMPLETED" ? "SUCCESS" : "FAILURE"
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Authorization failed" });
  }
}
