-- Seed data for Aegis Biometric Banking System

-- Seed Branches
INSERT INTO "Branch" ("id", "code", "name", "city", "address", "phone", "email", "status", "dailyTransactionLimit", "createdAt", "updatedAt")
VALUES
('br-1', 'BR-001', 'Main HQ Branch', 'Addis Ababa', 'Churchill Avenue, HQ Building', '+251111000001', 'hq@bank.com', 'ACTIVE', 5000000.0, NOW(), NOW()),
('br-2', 'BR-002', 'Bole Diplomatic Branch', 'Addis Ababa', 'Bole Road, Medhanialem', '+251111000002', 'bole@bank.com', 'ACTIVE', 3500000.0, NOW(), NOW()),
('br-3', 'BR-003', 'Kazanchis Financial Hub', 'Addis Ababa', 'UN Avenue', '+251111000003', 'kazanchis@bank.com', 'ACTIVE', 4000000.0, NOW(), NOW()),
('br-4', 'BR-004', 'Hawassa Regional Office', 'Hawassa', 'Lakefront Boulevard', '+251462000004', 'hawassa@bank.com', 'ACTIVE', 2000000.0, NOW(), NOW());

-- Seed Users (Bcrypt hashes are for 'password123')
-- Hash generated from bcrypt for password123
INSERT INTO "User" ("id", "username", "fullName", "email", "passwordHash", "role", "branchId", "avatarUrl", "isActive", "status", "lastLoginAt", "createdAt", "updatedAt")
VALUES
('sa-1', 'admin', 'Super Administrator', 'admin@bank.com', '$2b$10$pIFfyDJA8V5cxlEETd6Fl.hxvcdP7sJjpIC6jq2uxOXw6Mg1WYRjq', 'SUPER_ADMIN', NULL, NULL, TRUE, 'ACTIVE', NOW(), NOW(), NOW()),
('bm-1', 'manager', 'Dawit Wolde', 'manager@bank.com', '$2b$10$pIFfyDJA8V5cxlEETd6Fl.hxvcdP7sJjpIC6jq2uxOXw6Mg1WYRjq', 'BANK_MANAGER', 'br-1', NULL, TRUE, 'ACTIVE', NOW(), NOW(), NOW()),
('acc-1', 'accountant', 'Yohannes Lema', 'accountant@bank.com', '$2b$10$pIFfyDJA8V5cxlEETd6Fl.hxvcdP7sJjpIC6jq2uxOXw6Mg1WYRjq', 'ACCOUNTANT', 'br-1', NULL, TRUE, 'ACTIVE', NOW(), NOW(), NOW()),
('it-1', 'itadmin', 'Meron Bekele', 'itadmin@bank.com', '$2b$10$pIFfyDJA8V5cxlEETd6Fl.hxvcdP7sJjpIC6jq2uxOXw6Mg1WYRjq', 'SUPER_ADMIN_IT', NULL, NULL, TRUE, 'ACTIVE', NOW(), NOW(), NOW());

-- Seed Customers
INSERT INTO "Customer" ("id", "accountNumber", "fullName", "nationalId", "phone", "email", "accountType", "balance", "isBiometricEnrolled", "enrolledFingerprints", "status", "createdAt", "updatedAt")
VALUES
('c-1', 'ACC-100842', 'Abebe Bikila', 'NID-9048123', '+251911223344', 'abebe@athletics.com', 'SAVINGS', 15420.50, TRUE, ARRAY['RIGHT_INDEX'], 'ACTIVE', NOW() - INTERVAL '1 year', NOW()),
('c-2', 'ACC-100294', 'Frehiwot Tadesse', 'NID-9842104', '+251912883344', 'frehiwot@diplomat.com', 'CHECKING', 85200.00, TRUE, ARRAY['RIGHT_INDEX'], 'ACTIVE', NOW() - INTERVAL '6 months', NOW()),
('c-3', 'ACC-100412', 'Yonas Alemu', 'NID-8312048', '+251913993344', 'yonas@business.com', 'CORPORATE', 2450000.00, FALSE, '{}'::TEXT[], 'ACTIVE', NOW() - INTERVAL '3 months', NOW()),
('c-4', 'ACC-100501', 'Tilahun Gessesse', 'NID-7104812', '+251914773344', 'tilahun@music.com', 'SAVINGS', 32000.00, TRUE, ARRAY['LEFT_INDEX', 'RIGHT_INDEX'], 'FLAGGED', NOW() - INTERVAL '2 years', NOW());

-- Seed Transactions
INSERT INTO "Transaction" ("id", "referenceNumber", "accountNumber", "customerName", "type", "amount", "status", "biometricVerified", "accountantId", "branchId", "approvedById", "timestamp")
VALUES
('t-1', 'TX-2026-0001', 'ACC-100842', 'Abebe Bikila', 'CASH_WITHDRAWAL', 2500.00, 'COMPLETED', TRUE, 'acc-1', 'br-1', NULL, NOW() - INTERVAL '5 hours'),
('t-2', 'TX-2026-0002', 'ACC-100294', 'Frehiwot Tadesse', 'TRANSFER', 15000.00, 'COMPLETED', TRUE, 'acc-1', 'br-1', NULL, NOW() - INTERVAL '3 hours'),
('t-3', 'TX-2026-0003', 'ACC-100412', 'Yonas Alemu', 'CASH_WITHDRAWAL', 125000.00, 'PENDING_APPROVAL', FALSE, 'acc-1', 'br-1', NULL, NOW() - INTERVAL '30 minutes');

-- Seed System Audit Logs
INSERT INTO "SystemAuditLog" ("id", "timestamp", "actorId", "action", "category", "ipAddress", "details", "status")
VALUES
('al-1', NOW() - INTERVAL '8 hours', 'sa-1', 'USER_LOGIN', 'SECURITY', '192.168.1.50', 'Super administrator authenticated successfully via secure terminal passcode.', 'SUCCESS'),
('al-2', NOW() - INTERVAL '5 hours', 'acc-1', 'BIOMETRIC_MATCH_SUCCESS', 'BIOMETRIC', '192.168.1.104', 'Biometric scan matched Abebe Bikila (ACC-100842) right index finger with 99.98% confidence.', 'SUCCESS'),
('al-3', NOW() - INTERVAL '4 hours 58 minutes', 'acc-1', 'TRANSACTION_CREATE', 'TRANSACTION', '192.168.1.104', 'Processed cash withdrawal of 2500.00 for Abebe Bikila (ACC-100842). Biometrically verified.', 'SUCCESS'),
('al-4', NOW() - INTERVAL '3 hours', 'acc-1', 'BIOMETRIC_MATCH_SUCCESS', 'BIOMETRIC', '192.168.1.104', 'Biometric scan matched Frehiwot Tadesse (ACC-100294) right index finger with 98.7% confidence.', 'SUCCESS');
