import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";
import { TransactionType, TransactionStatus } from "@prisma/client";

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

  const numericAmount = parseFloat(amount);
  if (numericAmount <= 0) {
    res.status(400).json({ success: false, message: "Transaction amount must be positive" });
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

    // Check branch limit
    const branch = await prisma.branch.findUnique({
      where: { id: req.user.branchId || "br-1" }
    });

    const branchLimit = branch?.dailyTransactionLimit || 1000000;
    const requiresApproval = numericAmount > 50000 || !biometricVerified;

    let transactionStatus: TransactionStatus = "COMPLETED";

    if (requiresApproval) {
      transactionStatus = "PENDING_APPROVAL";
    }

    // If completed withdrawal, deduct balance immediately
    if (transactionStatus === "COMPLETED") {
      if (type === "CASH_WITHDRAWAL" || type === "TRANSFER") {
        if (customer.balance < numericAmount) {
          res.status(400).json({ success: false, message: "Insufficient account balance" });
          return;
        }
        await prisma.customer.update({
          where: { id: customer.id },
          data: { balance: customer.balance - numericAmount }
        });
      } else if (type === "CHEQUE_DEPOSIT") {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { balance: customer.balance + numericAmount }
        });
      }
    }

    const referenceNumber = `TX-${Date.now().toString().substring(5)}-${Math.floor(100 + Math.random() * 900)}`;

    const transaction = await prisma.transaction.create({
      data: {
        referenceNumber,
        accountNumber,
        customerName: customer.fullName,
        type: type as TransactionType,
        amount: numericAmount,
        status: transactionStatus,
        biometricVerified: !!biometricVerified,
        accountantId: req.user.id,
        branchId: req.user.branchId || "br-1"
      }
    });

    await logAuditEvent(
      req.user.id,
      "TRANSACTION_CREATE",
      "TRANSACTION",
      ipAddress,
      `Initiated transaction ${referenceNumber} (${type}) for customer: ${customer.fullName}. Amount: ${numericAmount}. Status: ${transactionStatus}. Biometric Verified: ${biometricVerified}`,
      transactionStatus === "COMPLETED" ? "SUCCESS" : "WARNING"
    );

    res.status(201).json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create transaction" });
  }
}

export async function getTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { status, type } = req.query;

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: status ? (status as TransactionStatus) : undefined,
        type: type ? (type as TransactionType) : undefined
      },
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

    if (tx.status !== "PENDING_APPROVAL") {
      res.status(400).json({ success: false, message: `Transaction has already been finalized: ${tx.status}` });
      return;
    }

    const nextStatus: TransactionStatus = decision === "APPROVED" ? "COMPLETED" : "REJECTED";

    if (nextStatus === "COMPLETED") {
      const customer = await prisma.customer.findUnique({ where: { accountNumber: tx.accountNumber } });
      if (!customer) {
        res.status(404).json({ success: false, message: "Customer account not found" });
        return;
      }

      // Deduct balance now since it was pending before
      if (tx.type === "CASH_WITHDRAWAL" || tx.type === "TRANSFER") {
        if (customer.balance < tx.amount) {
          res.status(400).json({ success: false, message: "Insufficient account balance to authorize payout" });
          return;
        }
        await prisma.customer.update({
          where: { id: customer.id },
          data: { balance: customer.balance - tx.amount }
        });
      } else if (tx.type === "CHEQUE_DEPOSIT") {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { balance: customer.balance + tx.amount }
        });
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: nextStatus,
        approvedById: req.user.id
      }
    });

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
