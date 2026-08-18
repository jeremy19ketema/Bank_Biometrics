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

export default function HRPage() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [passcode, setPasscode] = useState("");

  const [requests, setRequests] = useState<AccountantRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    loadApprovalRequests();
    loadEmployees();
  }, []);

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

    if (
      !username ||
      !fullName ||
      !email ||
      !branchId ||
      !passcode
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (passcode.length < 6) {
      setError("Passcode must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/staff/hr-accountant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username,
            fullName,
            email,
            branchId,
            passcode,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Failed to create Accountant request."
        );
        return;
      }

      setMessage(
        result.message ||
          "Accountant request created and sent to Bank Manager for approval."
      );

      setUsername("");
      setFullName("");
      setEmail("");
      setBranchId("");
      setPasscode("");

      await loadApprovalRequests();
      await loadEmployees();
    } catch (err) {
      console.error(err);

      setError(
        "Cannot connect to the backend. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status: string) {
    if (status === "APPROVED") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "REJECTED") {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#92400e",
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
        backgroundColor: "#f5f7fb",
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
            width: "250px",
            backgroundColor: "#111827",
            color: "white",
            padding: "25px 15px",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              padding: "10px 15px 30px",
            }}
          >
            Aegis Banking
          </div>

          <div
            style={{
              padding: "10px 15px",
              color: "#9ca3af",
              fontSize: "13px",
              marginBottom: "10px",
            }}
          >
            HUMAN RESOURCES
          </div>

          <button
            onClick={() => setActiveSection("dashboard")}
            style={{
              width: "100%",
              padding: "13px 15px",
              marginBottom: "8px",
              textAlign: "left",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor:
                activeSection === "dashboard"
                  ? "#2563eb"
                  : "transparent",
              color: "white",
              fontSize: "15px",
            }}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveSection("create")}
            style={{
              width: "100%",
              padding: "13px 15px",
              marginBottom: "8px",
              textAlign: "left",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor:
                activeSection === "create"
                  ? "#2563eb"
                  : "transparent",
              color: "white",
              fontSize: "15px",
            }}
          >
            Create Accountant
          </button>

          <button
            onClick={() => setActiveSection("requests")}
            style={{
              width: "100%",
              padding: "13px 15px",
              marginBottom: "8px",
              textAlign: "left",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor:
                activeSection === "requests"
                  ? "#2563eb"
                  : "transparent",
              color: "white",
              fontSize: "15px",
            }}
          >
            Accountant Requests
          </button>

          <button
            onClick={() => setActiveSection("employees")}
            style={{
              width: "100%",
              padding: "13px 15px",
              marginBottom: "8px",
              textAlign: "left",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor:
                activeSection === "employees"
                  ? "#2563eb"
                  : "transparent",
              color: "white",
              fontSize: "15px",
            }}
          >
            Employee Information
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            padding: "30px",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  color: "#111827",
                }}
              >
                Human Resources
              </h1>

              <p
                style={{
                  marginTop: "8px",
                  color: "#6b7280",
                }}
              >
                HR management dashboard
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                padding: "12px 18px",
                borderRadius: "10px",
                boxShadow:
                  "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <strong>Role:</strong> HR
            </div>
          </div>

          {/* DASHBOARD */}
          {activeSection === "dashboard" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  marginBottom: "30px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow:
                      "0 1px 5px rgba(0,0,0,0.08)",
                  }}
                >
                  <p
                    style={{
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    Pending Requests
                  </p>

                  <h2
                    style={{
                      margin: "10px 0 0",
                      fontSize: "32px",
                      color: "#d97706",
                    }}
                  >
                    {pendingCount}
                  </h2>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow:
                      "0 1px 5px rgba(0,0,0,0.08)",
                  }}
                >
                  <p
                    style={{
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    Approved Requests
                  </p>

                  <h2
                    style={{
                      margin: "10px 0 0",
                      fontSize: "32px",
                      color: "#16a34a",
                    }}
                  >
                    {approvedCount}
                  </h2>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow:
                      "0 1px 5px rgba(0,0,0,0.08)",
                  }}
                >
                  <p
                    style={{
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    Rejected Requests
                  </p>

                  <h2
                    style={{
                      margin: "10px 0 0",
                      fontSize: "32px",
                      color: "#dc2626",
                    }}
                  >
                    {rejectedCount}
                  </h2>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow:
                      "0 1px 5px rgba(0,0,0,0.08)",
                  }}
                >
                  <p
                    style={{
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    Accountants
                  </p>

                  <h2
                    style={{
                      margin: "10px 0 0",
                      fontSize: "32px",
                      color: "#2563eb",
                    }}
                  >
                    {employees.length}
                  </h2>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "25px",
                  boxShadow:
                    "0 1px 5px rgba(0,0,0,0.08)",
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  HR Responsibilities
                </h2>

                <ul
                  style={{
                    lineHeight: "2",
                    color: "#374151",
                  }}
                >
                  <li>Create Accountant requests.</li>

                  <li>
                    Select the branch where the
                    Accountant will work.
                  </li>

                  <li>
                    Send Accountant requests to the
                    Bank Manager.
                  </li>

                  <li>
                    Track pending, approved and
                    rejected requests.
                  </li>

                  <li>
                    View employee information.
                  </li>

                  <li>
                    Manage HR-related staff
                    information.
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* CREATE ACCOUNTANT */}
          {activeSection === "create" && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "30px",
                maxWidth: "800px",
                boxShadow:
                  "0 1px 5px rgba(0,0,0,0.08)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Create Accountant Request
              </h2>

              <p style={{ color: "#6b7280" }}>
                HR creates the Accountant account
                and sends it to the Bank Manager
                for approval.
              </p>

              {message && (
                <div
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {message}
                </div>
              )}

              {error && (
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateAccountant}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontWeight: "bold",
                      }}
                    >
                      Username
                    </label>

                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      placeholder="Accountant username"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border:
                          "1px solid #d1d5db",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontWeight: "bold",
                      }}
                    >
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                      placeholder="Employee full name"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border:
                          "1px solid #d1d5db",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontWeight: "bold",
                      }}
                    >
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="employee@email.com"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border:
                          "1px solid #d1d5db",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontWeight: "bold",
                      }}
                    >
                      Branch ID
                    </label>

                    <input
                      type="text"
                      value={branchId}
                      onChange={(e) =>
                        setBranchId(e.target.value)
                      }
                      placeholder="Enter branch ID"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border:
                          "1px solid #d1d5db",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontWeight: "bold",
                      }}
                    >
                      Temporary Passcode
                    </label>

                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) =>
                        setPasscode(e.target.value)
                      }
                      placeholder="Minimum 6 characters"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border:
                          "1px solid #d1d5db",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: "25px",
                    padding: "13px 25px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: loading
                      ? "#9ca3af"
                      : "#2563eb",
                    color: "white",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "15px",
                    fontWeight: "bold",
                  }}
                >
                  {loading
                    ? "Submitting..."
                    : "Create Accountant Request"}
                </button>
              </form>
            </div>
          )}

          {/* REQUESTS */}
          {activeSection === "requests" && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "25px",
                boxShadow:
                  "0 1px 5px rgba(0,0,0,0.08)",
                overflowX: "auto",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Accountant Requests
              </h2>

              {requests.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
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
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Request
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Branch
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {request.fullName}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {request.branchId}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <span
                            style={{
                              ...getStatusStyle(
                                request.status
                              ),
                              padding:
                                "6px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
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

          {/* EMPLOYEES */}
          {activeSection === "employees" && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "25px",
                boxShadow:
                  "0 1px 5px rgba(0,0,0,0.08)",
                overflowX: "auto",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Employee Information
              </h2>

              {employees.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
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
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Name
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Email
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Role
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Branch
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {employee.fullName}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {employee.email}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {employee.role}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {employee.branchName ||
                            "Unassigned"}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <span
                            style={{
                              ...getStatusStyle(
                                employee.status
                              ),
                              padding:
                                "6px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {employee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}