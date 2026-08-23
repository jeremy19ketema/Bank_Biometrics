"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCheck2,
  Hourglass,
  LayoutDashboard,
  Loader2,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type AccountantRequest = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  branchId: string;
  status: RequestStatus;
  createdAt: string;
};

type Employee = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  branchName?: string;
  status: string;
};

type BranchOption = {
  id: string;
  code: string;
  name: string;
  city: string;
};

type SectionKey = "dashboard" | "employees" | "attendance" | "approvals" | "reports";

const ATTENDANCE_STATUSES = ["PRESENT", "LATE", "ON_LEAVE", "ABSENT"] as const;

const ATTENDANCE_PILL: Record<string, string> = {
  PRESENT: "bg-[rgba(76,122,94,0.16)] text-[color:var(--moss)]",
  LATE: "bg-[rgba(198,154,76,0.16)] text-[color:var(--brass)]",
  ON_LEAVE: "bg-[rgba(139,92,246,0.16)] text-violet-300",
  ABSENT: "bg-[rgba(168,69,46,0.16)] text-[color:var(--clay)]",
};

const ATTENDANCE_BUTTON: Record<string, string> = {
  PRESENT: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15",
  LATE: "border-amber-500/40 text-amber-300 hover:bg-amber-500/15",
  ON_LEAVE: "border-violet-500/40 text-violet-300 hover:bg-violet-500/15",
  ABSENT: "border-red-500/40 text-red-300 hover:bg-red-500/15",
};

const inputClass =
  "w-full rounded-xl border border-[#1E293B] bg-[#0B192C] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-[color:var(--brass)] focus:outline-none";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400";

function statusPillClass(status: string): string {
  if (status === "APPROVED") return "status-pill bg-[rgba(76,122,94,0.16)] text-[color:var(--moss)]";
  if (status === "REJECTED") return "status-pill bg-[rgba(168,69,46,0.16)] text-[color:var(--clay)]";
  return "status-pill bg-[rgba(198,154,76,0.16)] text-[color:var(--brass)]";
}

export default function HRPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [employeeSubsection, setEmployeeSubsection] = useState("employee-info");

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [passcode, setPasscode] = useState("");

  const [itUsername, setItUsername] = useState("");
  const [itFullName, setItFullName] = useState("");
  const [itEmail, setItEmail] = useState("");
  const [itBranchId, setItBranchId] = useState("");
  const [itPasscode, setItPasscode] = useState("");
  const [itSaving, setItSaving] = useState(false);
  const [itMessage, setItMessage] = useState("");
  const [itError, setItError] = useState("");

  const [requests, setRequests] = useState<AccountantRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    loadApprovalRequests();
    loadEmployees();
    loadBranches();
  }, []);

  useEffect(() => {
    if (activeSection === "attendance") {
      loadAttendance();
    }
  }, [activeSection, attendanceDate]);

  async function loadBranches() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/branches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setBranches(result.data);
      } else {
        console.error("Failed to load branches:", result.message || response.status);
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
    }
  }

  async function loadAttendance() {
    setAttendanceLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/attendance?date=${attendanceDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setAttendanceRecords(result.data);
      }
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setAttendanceLoading(false);
    }
  }

  async function markAttendance(employeeId: string, status: string) {
    setMarkingId(employeeId);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId,
          date: attendanceDate,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to mark attendance.");
      }

      await loadAttendance();
    } catch (err) {
      console.error("Error marking attendance:", err);
      setError("Cannot reach the attendance service.");
    } finally {
      setMarkingId(null);
    }
  }

  async function loadApprovalRequests() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/approvals/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const accountantRequests = result.data
          .filter((item: any) => item.requestType === "CREATE_ACCOUNTANT")
          .map((item: any) => ({
            id: item.id,
            username: item.targetUserId || "N/A",
            fullName: item.details || "Accountant request",
            email: "",
            branchId: item.targetBranchId || "Unassigned",
            status: item.status,
            createdAt: item.createdAt,
          }));

        setRequests(accountantRequests);
      }
    } catch (err) {
      console.error("Failed to load approval requests:", err);
    }
  }

  async function loadEmployees() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/staff/accountants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setEmployees(
          result.data.map((employee: any) => ({
            id: employee.id,
            username: employee.username || employee.employeeId || "",
            fullName: employee.fullName,
            email: employee.email,
            role: "ACCOUNTANT",
            branchName: employee.branchName,
            status: employee.status,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  }

  async function handleCreateAccountant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!username?.trim()) {
      setError("Username is required.");
      return;
    }

    if (!fullName?.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!email?.trim()) {
      setError("Email is required.");
      return;
    }

    if (!branchId?.trim()) {
      setError("Branch ID is required.");
      return;
    }

    if (!passcode?.trim()) {
      setError("Temporary Passcode is required.");
      return;
    }

    if (passcode.length < 6) {
      setError("Passcode must be at least 6 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token missing. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/staff/hr-accountant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          branchId: branchId.trim(),
          passcode: passcode.trim(),
        }),
      });

      const result = await response.json();

      if (response.status === 403 && result.message?.includes("Invalid or expired token")) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        return;
      }

      if (!response.ok) {
        setError(result.message || "Failed to create Accountant request. Please try again.");
        return;
      }

      setMessage(
        result.message ||
          "Accountant request created successfully and sent to Bank Manager for approval."
      );

      setUsername("");
      setFullName("");
      setEmail("");
      setBranchId("");
      setPasscode("");

      await loadApprovalRequests();
      await loadEmployees();
    } catch (err) {
      console.error("Error creating accountant:", err);
      setError("Cannot connect to the backend. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBranchIT(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setItMessage("");
    setItError("");

    if (!itUsername?.trim()) {
      setItError("Username is required.");
      return;
    }

    if (!itFullName?.trim()) {
      setItError("Full Name is required.");
      return;
    }

    if (!itEmail?.trim()) {
      setItError("Email is required.");
      return;
    }

    if (!itBranchId?.trim()) {
      setItError("Branch is required.");
      return;
    }

    if (!itPasscode?.trim()) {
      setItError("Temporary Passcode is required.");
      return;
    }

    if (itPasscode.length < 6) {
      setItError("Passcode must be at least 6 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(itEmail)) {
      setItError("Please enter a valid email address.");
      return;
    }

    setItSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setItError("Authentication token missing. Please log in again.");
        setItSaving(false);
        return;
      }

      const response = await fetch(`${API_URL}/staff/branch-it`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: itUsername.trim(),
          fullName: itFullName.trim(),
          email: itEmail.trim(),
          branchId: itBranchId.trim(),
          passcode: itPasscode.trim(),
        }),
      });

      const result = await response.json();

      if (response.status === 403 && result.message?.includes("Invalid or expired token")) {
        setItError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        return;
      }

      if (!response.ok) {
        setItError(result.message || "Failed to create Branch IT user. Please try again.");
        return;
      }

      setItMessage(result.message || "Branch IT user created successfully.");

      setItUsername("");
      setItFullName("");
      setItEmail("");
      setItBranchId("");
      setItPasscode("");

      await loadEmployees();
    } catch (err) {
      console.error("Error creating Branch IT user:", err);
      setItError("Cannot connect to the backend. Make sure the backend is running on port 5000.");
    } finally {
      setItSaving(false);
    }
  }

  const pendingCount = requests.filter((request) => request.status === "PENDING").length;
  const approvedCount = requests.filter((request) => request.status === "APPROVED").length;
  const rejectedCount = requests.filter((request) => request.status === "REJECTED").length;

  const headerTitle: Record<string, string> = {
    dashboard: "HR command center",
    "employee-info": "Employee information",
    "create-accountant": "Create accountant request",
    "create-branch-it": "Provision Branch IT user",
    "accountant-requests": "Accountant requests",
    approvals: "Approval queue",
    attendance: "Daily attendance",
    reports: "HR reports",
  };

  const headerDesc: Record<string, string> = {
    dashboard: "Workforce readiness, pending requests and staff overview.",
    "employee-info": "All registered accountants across your branches.",
    "create-accountant": "Submit a new teller account for Bank Manager approval.",
    "create-branch-it": "Provision a Branch IT operator for a selected branch.",
    "accountant-requests": "Track every accountant creation request you filed.",
    approvals: "Monitor requests awaiting branch manager sign-off.",
    attendance: "Mark and review daily employee attendance.",
    reports: "Generate and review HR reports and statistics.",
  };

  const currentKey =
    activeSection === "employees" ? employeeSubsection : activeSection;

  const tabs: { key: SectionKey; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "employees", label: "Employees", icon: Users },
    { key: "attendance", label: "Attendance", icon: Clock },
    { key: "approvals", label: "Approval Queue", icon: Hourglass },
    { key: "reports", label: "Reports", icon: BarChart3 },
  ];

  const employeeTabs = [
    { key: "employee-info", label: "Information", icon: UserRound },
    { key: "create-accountant", label: "Create Accountant", icon: UserPlus },
    { key: "create-branch-it", label: "Create Branch IT", icon: MonitorSmartphone },
    { key: "accountant-requests", label: "Requests", icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="section-title mb-2">Human resources workspace</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              {headerTitle[currentKey] || "HR command center"}
            </h1>
            <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
              {headerDesc[currentKey] || ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper)]">
              <ShieldCheck className="h-4 w-4 text-[color:var(--brass)]" />
              HR Administrator
            </span>
            <button
              onClick={() => {
                loadApprovalRequests();
                loadEmployees();
                if (activeSection === "attendance") loadAttendance();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper-dim)] transition hover:text-[color:var(--ledger-paper)]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {(error || message) && (
        <div
          className={`rounded-2xl border p-4 text-xs font-medium ${
            error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Section rail + content */}
      <div className="grid items-start gap-6 lg:grid-cols-[230px_1fr]">
        <nav className="flex flex-col gap-1.5 rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-3 backdrop-blur-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] text-[color:var(--ledger-paper)]"
                    : "border border-transparent text-[color:var(--ledger-paper-dim)] hover:bg-[rgba(244,239,223,0.04)] hover:text-[color:var(--ledger-paper)]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[color:var(--brass)]" : ""}`} />
                {tab.label}
                {tab.key === "approvals" && pendingCount > 0 && (
                  <span className="ml-auto rounded-full bg-[rgba(198,154,76,0.18)] px-2 py-0.5 text-[11px] font-bold text-[color:var(--brass)]">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-6">

      {/* Employee sub-tabs */}
      {activeSection === "employees" && (
        <nav className="flex flex-wrap gap-2 rounded-[20px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-2 backdrop-blur-xl">
          {employeeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = employeeSubsection === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setEmployeeSubsection(tab.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] text-[color:var(--ledger-paper)]"
                    : "border border-transparent text-[color:var(--ledger-paper-dim)] hover:text-[color:var(--ledger-paper)]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[color:var(--brass)]" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* DASHBOARD */}
      {activeSection === "dashboard" && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Pending requests", value: String(pendingCount), delta: pendingCount > 0 ? "Awaiting sign-off" : "Queue clear", icon: FileCheck2 },
              { label: "Approved requests", value: String(approvedCount), delta: "Activated accounts", icon: CheckCircle2 },
              { label: "Rejected requests", value: String(rejectedCount), delta: "Needs re-filing", icon: Hourglass },
              { label: "Total accountants", value: String(employees.length), delta: `${employees.filter((e) => e.status === "ACTIVE").length} active`, icon: Users },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-5 shadow-[0_16px_40px_rgba(2,8,23,0.28)] transition hover:border-[color:var(--brass)]/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[color:var(--ledger-paper-dim)]">{metric.label}</span>
                    <div className="rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-2 text-[color:var(--brass)]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">{metric.value}</div>
                  <div className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">{metric.delta}</div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Recent requests */}
            <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-5 shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-title">Request pipeline</div>
                  <h2 className="mt-1 text-lg font-semibold text-[color:var(--ledger-paper)]">Latest filings</h2>
                </div>
                <button
                  onClick={() => {
                    setActiveSection("employees");
                    setEmployeeSubsection("accountant-requests");
                  }}
                  className="text-sm font-semibold text-[color:var(--brass)] hover:underline"
                >
                  Open full list →
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {requests.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4 text-sm text-[color:var(--ledger-paper-dim)]">
                    <CheckCircle2 className="h-5 w-5 text-[color:var(--moss)]" />
                    No accountant requests yet — file one from the Employees tab.
                  </div>
                ) : (
                  requests.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[color:var(--ledger-paper)]">
                          Accountant creation
                        </div>
                        <div className="mt-1 truncate text-sm text-[color:var(--ledger-paper-dim)]">
                          {item.fullName} ·{" "}
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                        </div>
                      </div>
                      <span className={`shrink-0 ${statusPillClass(item.status)}`}>{item.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-5 shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
              <div className="section-title">Mandate</div>
              <h2 className="mt-1 text-lg font-semibold text-[color:var(--ledger-paper)]">HR responsibilities</h2>

              <div className="mt-5 space-y-3">
                {[
                  "Create accountant requests and manage approvals",
                  "Assign branches to new accountant employees",
                  "Track pending, approved and rejected requests",
                  "Monitor employee information and status",
                  "Coordinate with bank managers for sign-off",
                  "Provision Branch IT operators",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4 text-sm text-[color:var(--ledger-paper-dim)]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--moss)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* EMPLOYEE INFO */}
      {activeSection === "employees" && employeeSubsection === "employee-info" && (
        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">Registered accountants</h3>
            <span className="mono text-xs text-ledger-paper-dim">{employees.length} on roster</span>
          </div>
          {employees.length === 0 ? (
            <div className="p-8 text-center text-sm text-[color:var(--ledger-paper-dim)]">
              No accountant employees found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th style={{ textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="font-semibold">{employee.fullName}</td>
                      <td className="text-ledger-paper-dim">{employee.email}</td>
                      <td>{employee.role}</td>
                      <td className="mono-cell">{employee.branchName || "Unassigned"}</td>
                      <td style={{ textAlign: "right" }}>
                        <span className={statusPillClass(employee.status)}>{employee.status.replace(/_/g, " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE ACCOUNTANT */}
      {activeSection === "employees" && employeeSubsection === "create-accountant" && (
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
          <div className="section-title">New filing</div>
          <h2 className="mt-1 text-lg font-semibold text-[color:var(--ledger-paper)]">Create accountant request</h2>
          <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
            This request will be sent to the Bank Manager for approval before the account is activated.
          </p>

          {message && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateAccountant} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Username *</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Full name *</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Employee full name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="employee@email.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Branch *</label>
                <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={inputClass}>
                  <option value="">Select a branch</option>
                  {branches.length === 0 && (
                    <option value="" disabled>
                      No branches loaded — refresh the page
                    </option>
                  )}
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} — {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Temporary passcode *</label>
                <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Minimum 6 characters" className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-6 py-3 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Submitting…" : "Create accountant request"}
            </button>
          </form>
        </div>
      )}

      {/* CREATE BRANCH IT */}
      {activeSection === "employees" && employeeSubsection === "create-branch-it" && (
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
          <div className="section-title">New provisioning</div>
          <h2 className="mt-1 text-lg font-semibold text-[color:var(--ledger-paper)]">Create Branch IT user</h2>
          <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
            The Branch IT account will be created immediately for the selected branch.
          </p>

          {itMessage && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300">
              {itMessage}
            </div>
          )}
          {itError && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
              {itError}
            </div>
          )}

          <form onSubmit={handleCreateBranchIT} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Username *</label>
                <input type="text" value={itUsername} onChange={(e) => setItUsername(e.target.value)} placeholder="Enter username" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Full name *</label>
                <input type="text" value={itFullName} onChange={(e) => setItFullName(e.target.value)} placeholder="Employee full name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={itEmail} onChange={(e) => setItEmail(e.target.value)} placeholder="employee@email.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Branch *</label>
                <select value={itBranchId} onChange={(e) => setItBranchId(e.target.value)} className={inputClass}>
                  <option value="">Select a branch</option>
                  {branches.length === 0 && (
                    <option value="" disabled>
                      No branches loaded — refresh the page
                    </option>
                  )}
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} — {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Temporary passcode *</label>
                <input type="password" value={itPasscode} onChange={(e) => setItPasscode(e.target.value)} placeholder="Minimum 6 characters" className={inputClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={itSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-6 py-3 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)] disabled:opacity-50"
            >
              {itSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {itSaving ? "Creating…" : "Create Branch IT user"}
            </button>
          </form>
        </div>
      )}

      {/* ACCOUNTANT REQUESTS */}
      {activeSection === "employees" && employeeSubsection === "accountant-requests" && (
        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">Accountant requests</h3>
            <span className="mono text-xs text-ledger-paper-dim">{requests.length} filings</span>
          </div>
          {requests.length === 0 ? (
            <div className="p-8 text-center text-sm text-[color:var(--ledger-paper-dim)]">
              No accountant requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="font-semibold">{request.fullName}</td>
                      <td className="mono-cell">{request.branchId}</td>
                      <td>
                        <span className={statusPillClass(request.status)}>{request.status}</span>
                      </td>
                      <td style={{ textAlign: "right" }} className="text-ledger-paper-dim text-xs">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPROVAL QUEUE */}
      {activeSection === "approvals" && (
        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">Pending approvals</h3>
            <Link href="/approvals" className="mono text-xs text-[color:var(--brass)] hover:underline">
              Open manager queue →
            </Link>
          </div>
          {requests.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[color:var(--moss)]" />
              <p className="text-sm text-[color:var(--ledger-paper-dim)]">All approvals are up to date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Request details</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="font-semibold">{request.fullName}</td>
                      <td className="mono-cell">{request.branchId}</td>
                      <td>
                        <span className={statusPillClass(request.status)}>{request.status}</span>
                      </td>
                      <td style={{ textAlign: "right" }} className="text-ledger-paper-dim text-xs">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ATTENDANCE */}
      {activeSection === "attendance" && (
        <div className="ledger-panel">
          <div className="ledger-head">
            <h3 className="display">Daily attendance</h3>
            <div className="flex items-center gap-2">
              <label className="mono text-xs text-ledger-paper-dim">Date:</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="rounded-lg border border-[#1E293B] bg-[#0B192C] px-3 py-1.5 text-xs text-slate-200 focus:border-[color:var(--brass)] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="mx-5 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-300">{error}</div>
          )}

          {attendanceLoading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-xs text-[color:var(--ledger-paper-dim)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading attendance…
            </div>
          ) : employees.length === 0 ? (
            <div className="p-10 text-center text-sm text-[color:var(--ledger-paper-dim)]">
              No employees found to track.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Marked status</th>
                    <th style={{ textAlign: "right" }}>Mark attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const record = attendanceRecords.find(
                      (r) => r.employee?.id === emp.id || r.employeeId === emp.id
                    );

                    return (
                      <tr key={emp.id}>
                        <td>
                          <div className="font-semibold">{emp.fullName}</div>
                          <div className="mono text-[11px] text-slate-500">@{emp.username}</div>
                        </td>
                        <td className="text-ledger-paper-dim">{emp.role}</td>
                        <td>
                          {record ? (
                            <span className={`status-pill ${ATTENDANCE_PILL[record.status] || ""}`}>
                              {record.status.replace(/_/g, " ")}
                            </span>
                          ) : (
                            <span className="text-xs text-[color:var(--ledger-paper-dim)]">Not marked</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="flex justify-end gap-1.5">
                            {ATTENDANCE_STATUSES.map((st) => (
                              <button
                                key={st}
                                onClick={() => markAttendance(emp.id, st)}
                                disabled={markingId === emp.id}
                                title={record?.status === st ? "Currently marked" : `Mark ${st.replace(/_/g, " ").toLowerCase()}`}
                                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-40 ${ATTENDANCE_BUTTON[st]} ${
                                  record?.status === st ? "ring-1 ring-current" : "opacity-70 hover:opacity-100"
                                }`}
                              >
                                {st.replace(/_/g, " ")}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REPORTS */}
      {activeSection === "reports" && (
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-10 text-center shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
          <div className="mx-auto mb-4 w-fit rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-3 text-[color:var(--brass)]">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-[color:var(--ledger-paper)]">Reports &amp; analytics</h2>
          <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
            Generate and view HR reports and workforce statistics here.
          </p>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
