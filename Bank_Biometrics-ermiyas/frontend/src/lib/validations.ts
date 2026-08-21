import { z } from "zod";

// ──────────────────────────────────────────────
// Branch
// ──────────────────────────────────────────────
export const branchSchema = z.object({
  name: z
    .string()
    .min(3, "Branch name must be at least 3 characters")
    .max(80, "Branch name must be at most 80 characters"),
  city: z
    .string()
    .min(2, "City is required")
    .max(60, "City name too long"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(150, "Address too long"),
  phone: z
    .string()
    .min(7, "Phone number is required")
    .max(20, "Phone number too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  email: z
    .string()
    .email("Invalid email address"),
  dailyTransactionLimit: z
    .number({ invalid_type_error: "Daily limit must be a number" })
    .min(100000, "Minimum daily limit is $100,000")
    .max(100000000, "Maximum daily limit is $100,000,000"),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]),
});

export type BranchFormValues = z.infer<typeof branchSchema>;

// ──────────────────────────────────────────────
// IT User
// ──────────────────────────────────────────────
export const itUserSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(80, "Full name too long"),
  email: z
    .string()
    .email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number is required")
    .max(20, "Phone number too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  department: z
    .string()
    .min(2, "Department is required")
    .max(80, "Department name too long"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export type ITUserFormValues = z.infer<typeof itUserSchema>;

// ──────────────────────────────────────────────
// Manager
// ──────────────────────────────────────────────
export const managerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(80, "Full name too long"),
  email: z
    .string()
    .email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number is required")
    .max(20, "Phone number too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  branchId: z
    .string()
    .min(1, "Branch assignment is required"),
  status: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED"]),
  assignedDate: z
    .string()
    .min(1, "Assignment date is required"),
});

export type ManagerFormValues = z.infer<typeof managerSchema>;
