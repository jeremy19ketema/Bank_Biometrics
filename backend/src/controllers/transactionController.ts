import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logAuditEvent } from "../utils/audit.js";
import { TransactionType, TransactionStatus } from "@prisma/client";

export async function createTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { accountNumber, amount, type, currency, referenceNumber, biometricScanId } = req.body;
  const ipAddress = req.ip || "unknown";

  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!accountNumber || amount === undefined || !type || !referenceNumber) {
    res.status(400).json({ success: false, message: "Missing accountNumber, amount, type, or referenceNumber" });
    return;
  }

  const numericAmount = parseFloat(amount);
  if (numericAmount <= 0) {
    res.status(400).json({ success: false, message: "Transaction amount must be positive" });
    return;
  }

  const txCurrency = currency || "ETB";

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

    // Fetch Transaction Policy
    let policy = await prisma.transactionPolicy.findUnique({
      where: { transactionType_currency: { transactionType: type as TransactionType, currency: txCurrency } }
    });

    // Provisional defaults if missing
    if (!policy) {
      const isHighRisk = type === "CASH_WITHDRAWAL" || type === "TRANSFER";
      policy = {
        id: "default",
        transactionType: type as TransactionType,
        currency: txCurrency,
        requiresBiometrics: isHighRisk,
        makerCheckerThreshold: 100000, // 100,000 ETB provisional default
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Enforce Biometrics if required by policy
    if (policy.requiresBiometrics) {
      if (!biometricScanId) {
        await logAuditEvent(req.user.id, "TRANSACTION_BLOCKED_NO_BIOMETRICS", "SECURITY", ipAddress, `Blocked ${type} without biometric proof`, "WARNING");
        res.status(403).json({ success: false, message: "Biometric authorization is required for this transaction type" });
        return;
      }

      const scanResult = await prisma.biometricScanResult.findUnique({ where: { scanId: biometricScanId } });
      if (!scanResult) {
        res.status(404).json({ success: false, message: "Biometric scan record not found" });
        return;
      }

      if (!scanResult.isMatch) {
        res.status(403).json({ success: false, message: "Provided biometric scan was not a match" });
        return;
      }

      if (scanResult.customerId !== customer.id) {
        res.status(403).json({ success: false, message: "Biometric scan belongs to a different customer" });
        return;
      }

      if (scanResult.transactionRef !== referenceNumber) {
        res.status(403).json({ success: false, message: "Biometric scan assertion is not bound to this specific transaction draft" });
        return;
      }
      
      // Amount and currency bindings
      if (scanResult.amount && scanResult.amount !== numericAmount) {
        res.status(403).json({ success: false, message: "Biometric assertion amount mismatch" });
        return;
      }
      if (scanResult.currency && scanResult.currency !== txCurrency) {
        res.status(403).json({ success: false, message: "Biometric assertion currency mismatch" });
        return;
      }
    }

    const requiresApproval = numericAmount > policy.makerCheckerThreshold;
    let transactionStatus: TransactionStatus = requiresApproval ? "PENDING_APPROVAL" : "COMPLETED";

    // Deduct balance immediately only if completed
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

    const transaction = await prisma.transaction.create({
      data: {
        referenceNumber,
        accountNumber,
        customerName: customer.fullName,
        type: type as TransactionType,
        amount: numericAmount,
        currency: txCurrency,
        status: transactionStatus,
        biometricVerified: !!biometricScanId,
        biometricScanId: biometricScanId || null,
        accountantId: req.user.id,
        branchId: req.user.branchId || "br-1"
      }
    });

    await logAuditEvent(
      req.user.id,
      "TRANSACTION_CREATE",
      "TRANSACTION",
      ipAddress,
      `Initiated transaction ${referenceNumber} (${type}) for customer: ${customer.fullName}. Amount: ${numericAmount} ${txCurrency}. Status: ${transactionStatus}.`,
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

    // Maker-Checker constraint: The approver cannot be the one who initiated it
    if (tx.accountantId === req.user.id) {
      await logAuditEvent(
        req.user.id,
        "TRANSACTION_APPROVAL_BLOCKED",
        "SECURITY",
        ipAddress,
        `Blocked self-approval attempt on transaction ${tx.referenceNumber}`,
        "WARNING"
      );
      res.status(403).json({ success: false, message: "Maker-checker violation: You cannot approve a transaction you initiated" });
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
