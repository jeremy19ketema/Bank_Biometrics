"use client";

import { useEffect, useState } from "react";

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

const SECTION_COLORS = {
  dashboard: { primary: "#2563eb", light: "#dbeafe", border: "#93c5fd" },
  employees: { primary: "#10b981", light: "#d1fae5", border: "#6ee7b7" },
  approvals: { primary: "#f59e0b", light: "rgba(198,154,76,0.15)", border: "#fcd34d" },
  reports: { primary: "#ec4899", light: "#fce7f3", border: "#fbcfe8" },
  attendance: { primary: "#0ea5e9", light: "#e0f2fe", border: "#7dd3fc" },
};

const ATTENDANCE_STATUSES = ["PRESENT", "LATE", "ON_LEAVE", "ABSENT"] as const;

const STATUS_BUTTON_STYLES: Record<string, { bg: string; hover: string }> = {
  PRESENT: { bg: "#10b981", hover: "#059669" },
  LATE: { bg: "#f59e0b", hover: "#d97706" },
  ON_LEAVE: { bg: "#8b5cf6", hover: "#7c3aed" },
  ABSENT: { bg: "#ef4444", hover: "#dc2626" },
};

export default function HRPage() {
  const [activeSection, setActiveSection] = useState("dashboard");
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

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
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
        console.error(
          "Failed to load branches:",
          result.message || response.status
        );
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
    }
  }

  async function loadAttendance() {
    setAttendanceLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/attendance?date=${attendanceDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
          .filter(
            (item: any) =>
              item.requestType === "CREATE_ACCOUNTANT"
          )
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
            username:
              employee.username || employee.employeeId || "",
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

  async function handleCreateAccountant(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    // Validation
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

    // Validate email format
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

      const response = await fetch(
        `${API_URL}/staff/hr-accountant`,
        {
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
        }
      );

      const result = await response.json();

      if (response.status === 403 && result.message?.includes("Invalid or expired token")) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        return;
      }

      if (!response.ok) {
        setError(
          result.message ||
            "Failed to create Accountant request. Please try again."
        );
        return;
      }

      setMessage(
        result.message ||
          "✅ Accountant request created successfully and sent to Bank Manager for approval."
      );

      // Clear form
      setUsername("");
      setFullName("");
      setEmail("");
      setBranchId("");
      setPasscode("");

      // Reload data
      await loadApprovalRequests();
      await loadEmployees();
    } catch (err) {
      console.error("Error creating accountant:", err);

      setError(
        "Cannot connect to the backend. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBranchIT(
    event: React.FormEvent<HTMLFormElement>
  ) {
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

      setItMessage(
        result.message || "✅ Branch IT user created successfully."
      );

      setItUsername("");
      setItFullName("");
      setItEmail("");
      setItBranchId("");
      setItPasscode("");

      await loadEmployees();
    } catch (err) {
      console.error("Error creating Branch IT user:", err);
      setItError(
        "Cannot connect to the backend. Make sure the backend is running on port 5000."
      );
    } finally {
      setItSaving(false);
    }
  }

  function getStatusStyle(status: string) {
    if (status === "APPROVED") {
      return {
        backgroundColor: "rgba(76,122,94,0.15)",
        color: "#4C7A5E",
      };
    }

    if (status === "REJECTED") {
      return {
        backgroundColor: "rgba(168,69,46,0.15)",
        color: "#A8452E",
      };
    }

    return {
      backgroundColor: "rgba(198,154,76,0.15)",
      color: "#C69A4C",
    };
  }

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "APPROVED"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "REJECTED"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0F1B2B",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            width: "280px",
            backgroundColor: "#0f172a",
            color: "white",
            padding: "30px 15px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              padding: "10px 15px 40px",
              color: "#ffffff",
            }}
          >
            🏦 Aegis Banking
          </div>

          <div
            style={{
              padding: "10px 15px",
              color: "#C9C2AE",
              fontSize: "12px",
              marginBottom: "20px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            HUMAN RESOURCES MENU
          </div>

          {/* Dashboard Button */}
          <button
            onClick={() => {
              setActiveSection("dashboard");
            }}
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "10px",
              textAlign: "left",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor:
                activeSection === "dashboard"
                  ? SECTION_COLORS.dashboard.primary
                  : "transparent",
              color: "white",
              fontSize: "15px",
              fontWeight: activeSection === "dashboard" ? "600" : "500",
              transition: "all 0.3s ease",
              borderLeft:
                activeSection === "dashboard"
                  ? `4px solid ${SECTION_COLORS.dashboard.border}`
                  : "4px solid transparent",
            }}
          >
            📊 Dashboard
          </button>

          {/* Employees Button with Submenu */}
          <button
            onClick={() => setActiveSection("employees")}
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "2px",
              textAlign: "left",
              border: "none",
              borderRadius: "10px 10px 0 0",
              cursor: "pointer",
              backgroundColor:
                activeSection === "employees"
                  ? SECTION_COLORS.employees.primary
                  : "transparent",
              color: "white",
              fontSize: "15px",
              fontWeight: activeSection === "employees" ? "600" : "500",
              transition: "all 0.3s ease",
              borderLeft:
                activeSection === "employees"
                  ? `4px solid ${SECTION_COLORS.employees.border}`
                  : "4px solid transparent",
            }}
          >
            👥 Employees
          </button>

          {/* Employees Submenu */}
          {activeSection === "employees" && (
            <div
              style={{
                backgroundColor: "#0B192C",
                borderRadius: "0 0 10px 10px",
                marginBottom: "10px",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setEmployeeSubsection("employee-info")}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 32px",
                  textAlign: "left",
                  border: "none",
                  backgroundColor:
                    employeeSubsection === "employee-info"
                      ? SECTION_COLORS.employees.light.replace("d1fae5", "a8e6c1").substring(0, 7) + "40"
                      : "transparent",
                  color:
                    employeeSubsection === "employee-info"
                      ? SECTION_COLORS.employees.primary
                      : "#C9C2AE",
                  fontSize: "14px",
                  fontWeight: employeeSubsection === "employee-info" ? "600" : "500",
                  cursor: "pointer",
                  borderLeft:
                    employeeSubsection === "employee-info"
                      ? `3px solid ${SECTION_COLORS.employees.primary}`
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                👤 Employee Information
              </button>

              <button
                onClick={() => setEmployeeSubsection("create-accountant")}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 32px",
                  textAlign: "left",
                  border: "none",
                  backgroundColor:
                    employeeSubsection === "create-accountant"
                      ? SECTION_COLORS.employees.light.replace("d1fae5", "a8e6c1").substring(0, 7) + "40"
                      : "transparent",
                  color:
                    employeeSubsection === "create-accountant"
                      ? SECTION_COLORS.employees.primary
                      : "#C9C2AE",
                  fontSize: "14px",
                  fontWeight: employeeSubsection === "create-accountant" ? "600" : "500",
                  cursor: "pointer",
                  borderLeft:
                    employeeSubsection === "create-accountant"
                      ? `3px solid ${SECTION_COLORS.employees.primary}`
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                ➕ Create Accountant
              </button>

              <button
                onClick={() => setEmployeeSubsection("create-branch-it")}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 32px",
                  textAlign: "left",
                  border: "none",
                  backgroundColor:
                    employeeSubsection === "create-branch-it"
                      ? SECTION_COLORS.employees.light.replace("d1fae5", "a8e6c1").substring(0, 7) + "40"
                      : "transparent",
                  color:
                    employeeSubsection === "create-branch-it"
                      ? SECTION_COLORS.employees.primary
                      : "#C9C2AE",
                  fontSize: "14px",
                  fontWeight: employeeSubsection === "create-branch-it" ? "600" : "500",
                  cursor: "pointer",
                  borderLeft:
                    employeeSubsection === "create-branch-it"
                      ? `3px solid ${SECTION_COLORS.employees.primary}`
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                ➕ Create Branch IT
              </button>

              <button
                onClick={() => setEmployeeSubsection("accountant-requests")}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 32px",
                  textAlign: "left",
                  border: "none",
                  backgroundColor:
                    employeeSubsection === "accountant-requests"
                      ? SECTION_COLORS.employees.light.replace("d1fae5", "a8e6c1").substring(0, 7) + "40"
                      : "transparent",
                  color:
                    employeeSubsection === "accountant-requests"
                      ? SECTION_COLORS.employees.primary
                      : "#C9C2AE",
                  fontSize: "14px",
                  fontWeight: employeeSubsection === "accountant-requests" ? "600" : "500",
                  cursor: "pointer",
                  borderLeft:
                    employeeSubsection === "accountant-requests"
                      ? `3px solid ${SECTION_COLORS.employees.primary}`
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                📋 Accountant Requests
              </button>
            </div>
          )}

          {/* Attendance Button */}
          <button
            onClick={() => setActiveSection("attendance")}
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "10px",
              textAlign: "left",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor:
                activeSection === "attendance"
                  ? SECTION_COLORS.attendance.primary
                  : "transparent",
              color: "white",
              fontSize: "15px",
              fontWeight: activeSection === "attendance" ? "600" : "500",
              transition: "all 0.3s ease",
              borderLeft:
                activeSection === "attendance"
                  ? `4px solid ${SECTION_COLORS.attendance.border}`
                  : "4px solid transparent",
            }}
          >
            🕒 Attendance
          </button>

          {/* Approval Queue Button */}
          <button
            onClick={() => setActiveSection("approvals")}
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "10px",
              textAlign: "left",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor:
                activeSection === "approvals"
                  ? SECTION_COLORS.approvals.primary
                  : "transparent",
              color: "white",
              fontSize: "15px",
              fontWeight: activeSection === "approvals" ? "600" : "500",
              transition: "all 0.3s ease",
              borderLeft:
                activeSection === "approvals"
                  ? `4px solid ${SECTION_COLORS.approvals.border}`
                  : "4px solid transparent",
            }}
          >
            ⏳ Approval Queue
          </button>

          {/* Reports Button */}
          <button
            onClick={() => setActiveSection("reports")}
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "10px",
              textAlign: "left",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor:
                activeSection === "reports"
                  ? SECTION_COLORS.reports.primary
                  : "transparent",
              color: "white",
              fontSize: "15px",
              fontWeight: activeSection === "reports" ? "600" : "500",
              transition: "all 0.3s ease",
              borderLeft:
                activeSection === "reports"
                  ? `4px solid ${SECTION_COLORS.reports.border}`
                  : "4px solid transparent",
            }}
          >
            📈 Reports
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            padding: "40px",
            backgroundColor: "#0B192C",
            overflowY: "auto",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  color: "#0f172a",
                  fontWeight: "700",
                }}
              >
                {activeSection === "dashboard" && "📊 Dashboard"}
                {activeSection === "employees" && employeeSubsection === "employee-info" && "👤 Employee Information"}
                {activeSection === "employees" && employeeSubsection === "create-accountant" && "➕ Create Accountant"}
                {activeSection === "employees" && employeeSubsection === "create-branch-it" && "➕ Create Branch IT"}
                {activeSection === "employees" && employeeSubsection === "accountant-requests" && "📋 Accountant Requests"}
                {activeSection === "approvals" && "⏳ Approval Queue"}
                {activeSection === "reports" && "📈 Reports"}
              </h1>

              <p
                style={{
                  marginTop: "8px",
                  color: "#C9C2AE",
                  fontSize: "15px",
                }}
              >
                {activeSection === "dashboard" && "Overview of HR metrics and statistics"}
                {activeSection === "employees" && employeeSubsection === "employee-info" && "View all registered accountants and their details"}
                {activeSection === "employees" && employeeSubsection === "create-accountant" && "Create new Accountant account requests"}
                {activeSection === "employees" && employeeSubsection === "create-branch-it" && "Provision a new Branch IT user for a selected branch"}
                {activeSection === "employees" && employeeSubsection === "accountant-requests" && "Track pending and approved Accountant requests"}
                {activeSection === "approvals" && "Review and manage pending approvals"}
                {activeSection === "attendance" && "Mark and review daily employee attendance"}
                {activeSection === "reports" && "View and generate HR reports"}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                padding: "14px 22px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                fontSize: "14px",
                fontWeight: "600",
                color: "#0f172a",
              }}
            >
              Role: <span style={{ color: SECTION_COLORS.dashboard.primary }}>HR Administrator</span>
            </div>
          </div>

          {/* DASHBOARD */}
          {activeSection === "dashboard" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                  marginBottom: "40px",
                }}
              >
                {/* Pending Requests Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "28px",
                    borderRadius: "14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    borderTop: `4px solid ${SECTION_COLORS.approvals.primary}`,
                    transition: "transform 0.2s",
                  }}
                >
                  <p
                    style={{
                      color: "#C9C2AE",
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    ⏳ Pending Requests
                  </p>

                  <h2
                    style={{
                      margin: "12px 0 0",
                      fontSize: "36px",
                      color: SECTION_COLORS.approvals.primary,
                      fontWeight: "700",
                    }}
                  >
                    {pendingCount}
                  </h2>
                </div>

                {/* Approved Requests Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "28px",
                    borderRadius: "14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    borderTop: `4px solid ${SECTION_COLORS.employees.primary}`,
                  }}
                >
                  <p
                    style={{
                      color: "#C9C2AE",
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    ✅ Approved Requests
                  </p>

                  <h2
                    style={{
                      margin: "12px 0 0",
                      fontSize: "36px",
                      color: SECTION_COLORS.employees.primary,
                      fontWeight: "700",
                    }}
                  >
                    {approvedCount}
                  </h2>
                </div>

                {/* Rejected Requests Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "28px",
                    borderRadius: "14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    borderTop: `4px solid #ef4444`,
                  }}
                >
                  <p
                    style={{
                      color: "#C9C2AE",
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    ❌ Rejected Requests
                  </p>

                  <h2
                    style={{
                      margin: "12px 0 0",
                      fontSize: "36px",
                      color: "#A8452E",
                      fontWeight: "700",
                    }}
                  >
                    {rejectedCount}
                  </h2>
                </div>

                {/* Total Accountants Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "28px",
                    borderRadius: "14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    borderTop: `4px solid ${SECTION_COLORS.dashboard.primary}`,
                  }}
                >
                  <p
                    style={{
                      color: "#C9C2AE",
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    👥 Total Accountants
                  </p>

                  <h2
                    style={{
                      margin: "12px 0 0",
                      fontSize: "36px",
                      color: SECTION_COLORS.dashboard.primary,
                      fontWeight: "700",
                    }}
                  >
                    {employees.length}
                  </h2>
                </div>
              </div>

              {/* HR Responsibilities Card */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  padding: "32px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  borderLeft: `5px solid ${SECTION_COLORS.dashboard.primary}`,
                }}
              >
                <h2 style={{ marginTop: 0, color: "#0f172a", fontSize: "20px" }}>
                  📋 HR Responsibilities
                </h2>

                <ul
                  style={{
                    lineHeight: "2.2",
                    color: "#475569",
                    marginTop: "16px",
                    paddingLeft: "20px",
                  }}
                >
                  <li>✓ Create Accountant requests and manage approvals</li>
                  <li>✓ Assign branches to new Accountant employees</li>
                  <li>✓ Track all pending, approved, and rejected requests</li>
                  <li>✓ Monitor employee information and status</li>
                  <li>✓ Coordinate with Bank Managers for approvals</li>
                  <li>✓ Generate and review HR reports</li>
                </ul>
              </div>
            </>
          )}

          {/* EMPLOYEES SECTION */}
          {activeSection === "employees" && (
            <>
              {/* Employee Information View */}
              {employeeSubsection === "employee-info" && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    padding: "28px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    overflowX: "auto",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      color: "#0f172a",
                      fontSize: "18px",
                    }}
                  >
                    Registered Accountants
                  </h3>

                  {employees.length === 0 ? (
                    <p style={{ color: "#C9C2AE" }}>
                      No Accountant employees found.
                    </p>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              SECTION_COLORS.employees
                                .light,
                          }}
                        >
                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS.employees
                                .primary,
                            }}
                          >
                            Name
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS.employees
                                .primary,
                            }}
                          >
                            Email
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS.employees
                                .primary,
                            }}
                          >
                            Role
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS.employees
                                .primary,
                            }}
                          >
                            Branch
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS.employees
                                .primary,
                            }}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {employees.map((employee) => (
                          <tr
                            key={employee.id}
                            style={{
                              borderBottom:
                                "1px solid #e2e8f0",
                              transition:
                                "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(198,154,76,0.04)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <td
                              style={{
                                padding: "14px",
                              }}
                            >
                              {employee.fullName}
                            </td>

                            <td
                              style={{
                                padding: "14px",
                                color: "#C9C2AE",
                              }}
                            >
                              {employee.email}
                            </td>

                            <td
                              style={{
                                padding: "14px",
                                color: "#C9C2AE",
                              }}
                            >
                              {employee.role}
                            </td>

                            <td
                              style={{
                                padding: "14px",
                                color: "#C9C2AE",
                              }}
                            >
                              {employee.branchName ||
                                "Unassigned"}
                            </td>

                            <td
                              style={{
                                padding: "14px",
                              }}
                            >
                              <span
                                style={{
                                  ...getStatusStyle(
                                    employee.status
                                  ),
                                  padding:
                                    "6px 12px",
                                  borderRadius:
                                    "20px",
                                  fontSize: "12px",
                                  fontWeight:
                                    "600",
                                }}
                              >
                                {
                                  employee.status
                                }
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Create Accountant Form */}
              {employeeSubsection === "create-accountant" && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    padding: "32px",
                    maxWidth: "900px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      color: "#0f172a",
                      fontSize: "18px",
                    }}
                  >
                    Create New Accountant Request
                  </h3>

                  <p
                    style={{
                      color: "#C9C2AE",
                      marginTop: "8px",
                    }}
                  >
                    Fill in the form below to create a new Accountant account. This
                    request will be sent to the Bank Manager for approval.
                  </p>

                  {message && (
                    <div
                      style={{
                        backgroundColor:
                          SECTION_COLORS
                            .employees.light,
                        color: SECTION_COLORS
                          .employees.primary,
                        padding: "16px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        borderLeft: `4px solid ${SECTION_COLORS.employees.primary}`,
                      }}
                    >
                      ✅ {message}
                    </div>
                  )}

                  {error && (
                    <div
                      style={{
                        backgroundColor: "rgba(168,69,46,0.15)",
                        color: "#A8452E",
                        padding: "16px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        borderLeft: "4px solid #dc2626",
                      }}
                    >
                      ❌ {error}
                    </div>
                  )}

                  <form
                    onSubmit={handleCreateAccountant}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Username *
                        </label>

                        <input
                          type="text"
                          value={username}
                          onChange={(e) =>
                            setUsername(
                              e.target.value
                            )
                          }
                          placeholder="Enter username"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: `1.5px solid #e2e8f0`,
                            borderRadius: "8px",
                            boxSizing:
                              "border-box",
                            fontSize: "14px",
                            transition:
                              "border-color 0.3s",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              SECTION_COLORS
                                .employees
                                .primary;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "#e2e8f0";
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Full Name *
                        </label>

                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) =>
                            setFullName(
                              e.target.value
                            )
                          }
                          placeholder="Employee full name"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: `1.5px solid #e2e8f0`,
                            borderRadius: "8px",
                            boxSizing:
                              "border-box",
                            fontSize: "14px",
                            transition:
                              "border-color 0.3s",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              SECTION_COLORS
                                .employees
                                .primary;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "#e2e8f0";
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Email *
                        </label>

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                          placeholder="employee@email.com"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: `1.5px solid #e2e8f0`,
                            borderRadius: "8px",
                            boxSizing:
                              "border-box",
                            fontSize: "14px",
                            transition:
                              "border-color 0.3s",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              SECTION_COLORS
                                .employees
                                .primary;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "#e2e8f0";
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Branch *
                        </label>

                        <select
                          value={branchId}
                          onChange={(e) =>
                            setBranchId(
                              e.target.value
                            )
                          }
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: `1.5px solid #e2e8f0`,
                            borderRadius: "8px",
                            boxSizing:
                              "border-box",
                            fontSize: "14px",
                            transition:
                              "border-color 0.3s",
                            backgroundColor: "#ffffff",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              SECTION_COLORS
                                .employees
                                .primary;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "#e2e8f0";
                          }}
                        >
                          <option value="">
                            Select a branch
                          </option>

                          {branches.length === 0 && (
                            <option value="" disabled>
                              No branches loaded — refresh the page
                            </option>
                          )}

                          {branches.map((b) => (
                            <option
                              key={b.id}
                              value={b.id}
                            >
                              {b.code} — {b.name} ({b.city})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Temporary Passcode *
                        </label>

                        <input
                          type="password"
                          value={passcode}
                          onChange={(e) =>
                            setPasscode(
                              e.target.value
                            )
                          }
                          placeholder="Minimum 6 characters"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: `1.5px solid #e2e8f0`,
                            borderRadius: "8px",
                            boxSizing:
                              "border-box",
                            fontSize: "14px",
                            transition:
                              "border-color 0.3s",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor =
                              SECTION_COLORS
                                .employees
                                .primary;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                              "#e2e8f0";
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        marginTop: "28px",
                        padding: "14px 32px",
                        border: "none",
                        borderRadius: "8px",
                        backgroundColor: loading
                          ? "#C9C2AE"
                          : SECTION_COLORS
                              .employees
                              .primary,
                        color: "white",
                        cursor: loading
                          ? "not-allowed"
                          : "pointer",
                        fontSize: "15px",
                        fontWeight: "600",
                        transition:
                          "background-color 0.3s",
                      }}
                    >
                      {loading
                        ? "Submitting..."
                        : "✓ Create Accountant Request"}
                    </button>
                  </form>
                </div>
              )}

              {/* Create Branch IT View */}
              {employeeSubsection === "create-branch-it" && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    padding: "32px",
                    maxWidth: "900px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      color: "#0f172a",
                      fontSize: "18px",
                    }}
                  >
                    Create New Branch IT User
                  </h3>

                  <p
                    style={{
                      color: "#C9C2AE",
                      marginTop: "8px",
                    }}
                  >
                    Fill in the form below to provision a Branch IT user for a
                    branch. The account will be created immediately.
                  </p>

                  {itMessage && (
                    <div
                      style={{
                        backgroundColor:
                          SECTION_COLORS.employees.light,
                        color: SECTION_COLORS.employees.primary,
                        padding: "16px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        borderLeft: `4px solid ${SECTION_COLORS.employees.primary}`,
                      }}
                    >
                      ✅ {itMessage}
                    </div>
                  )}

                  {itError && (
                    <div
                      style={{
                        backgroundColor: "rgba(168,69,46,0.15)",
                        color: "#A8452E",
                        padding: "16px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        borderLeft: "4px solid #dc2626",
                      }}
                    >
                      ❌ {itError}
                    </div>
                  )}

                  <form onSubmit={handleCreateBranchIT}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Username *
                        </label>

                        <input
                          type="text"
                          value={itUsername}
                          onChange={(e) => setItUsername(e.target.value)}
                          placeholder="Enter username"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "8px",
                            boxSizing: "border-box",
                            fontSize: "14px",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Full Name *
                        </label>

                        <input
                          type="text"
                          value={itFullName}
                          onChange={(e) => setItFullName(e.target.value)}
                          placeholder="Employee full name"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "8px",
                            boxSizing: "border-box",
                            fontSize: "14px",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Email *
                        </label>

                        <input
                          type="email"
                          value={itEmail}
                          onChange={(e) => setItEmail(e.target.value)}
                          placeholder="employee@email.com"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "8px",
                            boxSizing: "border-box",
                            fontSize: "14px",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Branch *
                        </label>

                        <select
                          value={itBranchId}
                          onChange={(e) => setItBranchId(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "8px",
                            boxSizing: "border-box",
                            fontSize: "14px",
                            backgroundColor: "#ffffff",
                          }}
                        >
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
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                        >
                          Temporary Passcode *
                        </label>

                        <input
                          type="password"
                          value={itPasscode}
                          onChange={(e) => setItPasscode(e.target.value)}
                          placeholder="Minimum 6 characters"
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "8px",
                            boxSizing: "border-box",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={itSaving}
                      style={{
                        marginTop: "28px",
                        padding: "14px 32px",
                        border: "none",
                        borderRadius: "8px",
                        backgroundColor: itSaving
                          ? "#C9C2AE"
                          : SECTION_COLORS.employees.primary,
                        color: "white",
                        cursor: itSaving ? "not-allowed" : "pointer",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      {itSaving ? "Creating..." : "✓ Create Branch IT User"}
                    </button>
                  </form>
                </div>
              )}

              {/* Accountant Requests View */}
              {employeeSubsection === "accountant-requests" && (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    padding: "28px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    overflowX: "auto",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      color: "#0f172a",
                      fontSize: "18px",
                    }}
                  >
                    Pending Accountant Requests
                  </h3>

                  {requests.length === 0 ? (
                    <p style={{ color: "#C9C2AE" }}>
                      No Accountant requests found.
                    </p>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              SECTION_COLORS
                                .employees
                                .light,
                          }}
                        >
                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS
                                .employees
                                .primary,
                            }}
                          >
                            Request
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS
                                .employees
                                .primary,
                            }}
                          >
                            Branch
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS
                                .employees
                                .primary,
                            }}
                          >
                            Status
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "14px",
                              borderBottom: `2px solid ${SECTION_COLORS.employees.border}`,
                              fontWeight: "600",
                              color: SECTION_COLORS
                                .employees
                                .primary,
                            }}
                          >
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {requests.map((request) => (
                          <tr
                            key={request.id}
                            style={{
                              borderBottom:
                                "1px solid #e2e8f0",
                              transition:
                                "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(198,154,76,0.04)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <td
                              style={{
                                padding: "14px",
                              }}
                            >
                              {request.fullName}
                            </td>

                            <td
                              style={{
                                padding: "14px",
                                color: "#C9C2AE",
                              }}
                            >
                              {request.branchId}
                            </td>

                            <td
                              style={{
                                padding: "14px",
                              }}
                            >
                              <span
                                style={{
                                  ...getStatusStyle(
                                    request.status
                                  ),
                                  padding:
                                    "6px 12px",
                                  borderRadius:
                                    "20px",
                                  fontSize: "12px",
                                  fontWeight:
                                    "600",
                                }}
                              >
                                {request.status}
                              </span>
                            </td>

                            <td
                              style={{
                                padding: "14px",
                                color: "#C9C2AE",
                              }}
                            >
                              {request.createdAt
                                ? new Date(
                                    request.createdAt
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}

          {/* APPROVAL QUEUE SECTION */}
          {activeSection === "approvals" && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "14px",
                padding: "28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflowX: "auto",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#0f172a",
                  fontSize: "18px",
                }}
              >
                Pending Approvals
              </h3>

              {requests.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#C9C2AE",
                  }}
                >
                  <p style={{ fontSize: "16px" }}>
                    ✓ All approvals are up to date!
                  </p>
                </div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          SECTION_COLORS.approvals
                            .light,
                      }}
                    >
                      <th
                        style={{
                          textAlign: "left",
                          padding: "14px",
                          borderBottom: `2px solid ${SECTION_COLORS.approvals.border}`,
                          fontWeight: "600",
                          color: SECTION_COLORS
                            .approvals.primary,
                        }}
                      >
                        Request Details
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "14px",
                          borderBottom: `2px solid ${SECTION_COLORS.approvals.border}`,
                          fontWeight: "600",
                          color: SECTION_COLORS
                            .approvals.primary,
                        }}
                      >
                        Branch
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "14px",
                          borderBottom: `2px solid ${SECTION_COLORS.approvals.border}`,
                          fontWeight: "600",
                          color: SECTION_COLORS
                            .approvals.primary,
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "14px",
                          borderBottom: `2px solid ${SECTION_COLORS.approvals.border}`,
                          fontWeight: "600",
                          color: SECTION_COLORS
                            .approvals.primary,
                        }}
                      >
                        Submitted Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          transition:
                            "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(198,154,76,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "transparent";
                        }}
                      >
                        <td
                          style={{
                            padding: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {request.fullName}
                        </td>

                        <td
                          style={{
                            padding: "14px",
                            color: "#C9C2AE",
                          }}
                        >
                          {request.branchId}
                        </td>

                        <td
                          style={{
                            padding: "14px",
                          }}
                        >
                          <span
                            style={{
                              ...getStatusStyle(
                                request.status
                              ),
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "14px",
                            color: "#C9C2AE",
                          }}
                        >
                          {request.createdAt
                            ? new Date(
                                request.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}


          {/* ATTENDANCE SECTION */}
          {activeSection === "attendance" && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "14px",
                padding: "32px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <h3 style={{ margin: 0, color: "#0f172a", fontSize: "20px" }}>
                  🕒 Daily Attendance
                </h3>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                    Date:
                  </label>

                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    style={{
                      padding: "10px 12px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    padding: "12px 16px",
                    marginBottom: "16px",
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

              {attendanceLoading ? (
                <p style={{ textAlign: "center", color: "#C9C2AE", padding: "32px 0" }}>
                  Loading attendance…
                </p>
              ) : employees.length === 0 ? (
                <p style={{ textAlign: "center", color: "#C9C2AE", padding: "32px 0" }}>
                  No employees found to track.
                </p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                      <th style={{ padding: "12px 8px", color: "#64748b" }}>Employee</th>
                      <th style={{ padding: "12px 8px", color: "#64748b" }}>Role</th>
                      <th style={{ padding: "12px 8px", color: "#64748b" }}>Marked Status</th>
                      <th style={{ padding: "12px 8px", color: "#64748b" }}>Mark Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => {
                      const record = attendanceRecords.find(
                        (r) => r.employee?.id === emp.id || r.employeeId === emp.id
                      );

                      return (
                        <tr key={emp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 8px" }}>
                            <div style={{ fontWeight: "600", color: "#0f172a" }}>{emp.fullName}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>@{emp.username}</div>
                          </td>

                          <td style={{ padding: "12px 8px", color: "#475569" }}>{emp.role}</td>

                          <td style={{ padding: "12px 8px" }}>
                            {record ? (
                              <span
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "999px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  backgroundColor:
                                    record.status === "PRESENT"
                                      ? "#d1fae5"
                                      : record.status === "LATE"
                                      ? "#fef3c7"
                                      : record.status === "ON_LEAVE"
                                      ? "#ede9fe"
                                      : "#fee2e2",
                                  color:
                                    record.status === "PRESENT"
                                      ? "#065f46"
                                      : record.status === "LATE"
                                      ? "#92400e"
                                      : record.status === "ON_LEAVE"
                                      ? "#5b21b6"
                                      : "#991b1b",
                                }}
                              >
                                {record.status.replace("_", " ")}
                              </span>
                            ) : (
                              <span style={{ color: "#C9C2AE", fontSize: "13px" }}>Not marked</span>
                            )}
                          </td>

                          <td style={{ padding: "12px 8px" }}>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {ATTENDANCE_STATUSES.map((st) => (
                                <button
                                  key={st}
                                  onClick={() => markAttendance(emp.id, st)}
                                  disabled={markingId === emp.id}
                                  style={{
                                    padding: "6px 12px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: markingId === emp.id ? "wait" : "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "white",
                                    backgroundColor: STATUS_BUTTON_STYLES[st].bg,
                                    opacity: markingId === emp.id ? 0.5 : record?.status === st ? 1 : 0.55,
                                    outline: record?.status === st ? `2px solid ${STATUS_BUTTON_STYLES[st].hover}` : "none",
                                  }}
                                >
                                  {st.replace("_", " ")}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* REPORTS SECTION */}
          {activeSection === "reports" && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "14px",
                padding: "32px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#C9C2AE",
                }}
              >
                <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}>
                  📈
                </p>
                <p style={{ fontSize: "16px" }}>
                  Reports and analytics coming soon.
                </p>
                <p style={{ fontSize: "14px", color: "#C9C2AE" }}>
                  Generate and view HR reports and statistics here.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
