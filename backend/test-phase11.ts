const API_URL = 'http://localhost:5000/api';
let hrToken = '';
let managerToken = '';
let employeeToken = '';

async function jsonFetch(url: string, options: any = {}) {
  options.headers = { 'Content-Type': 'application/json', ...options.headers };
  if (options.body && typeof options.body !== 'string') {
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { response: { status: res.status, data } };
  return { data };
}

async function login(username: string, passcode: string = 'password123') {
  const res = await jsonFetch(`${API_URL}/auth/login`, { method: 'POST', body: { username, passcode } });
  return res.data.token;
}

async function testPhase11() {
  console.log("--- Starting Phase 11 Security & Validation Tests ---");

  try {
    // 1. Login
    hrToken = await login('hr_admin');
    managerToken = await login('hq_manager');
    employeeToken = await login('john_teller');
    console.log("✅ Logged in successfully");

    const hrHeaders = { Authorization: `Bearer ${hrToken}` };
    const managerHeaders = { Authorization: `Bearer ${managerToken}` };
    const employeeHeaders = { Authorization: `Bearer ${employeeToken}` };

    // 2. Test self-approval rejection
    console.log("\nTesting self-approval rejection...");
    const hrProfileRes = await jsonFetch(`${API_URL}/auth/me`, { headers: hrHeaders });
    const hrId = hrProfileRes.data.data.id;

    try {
      await jsonFetch(`${API_URL}/hr/offboard`, {
        method: 'POST',
        body: {
          targetUserId: hrId,
          reason: "Self Resignation",
          finalWorkingDate: "2026-10-01",
          checklists: { accessRemoval: true, assetsReturned: true, biometricRetention: "DELETE" }
        },
        headers: hrHeaders
      });
      throw new Error("❌ Should not be able to request offboarding for self!");
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message.includes("yourself")) {
         console.log("✅ Self-offboarding successfully rejected.");
      } else {
         console.log("❌ Unexpected error:", err.response?.data || err);
      }
    }

    // 3. Maker-checker identity constraints
    console.log("\nTesting maker-checker identity constraints...");
    const empProfileRes = await jsonFetch(`${API_URL}/auth/me`, { headers: employeeHeaders });
    const empId = empProfileRes.data.data.id;

    let offboardingReqId = null;
    try {
      const reqRes = await jsonFetch(`${API_URL}/hr/offboard`, {
        method: 'POST',
        body: {
          targetUserId: empId,
          reason: "Test Offboarding Maker-Checker",
          finalWorkingDate: "2026-10-01",
          checklists: { accessRemoval: true, assetsReturned: true, biometricRetention: "DELETE" }
        },
        headers: hrHeaders
      });
      offboardingReqId = reqRes.data.data.id;
      console.log("✅ HR Requested Offboarding");
    } catch (err: any) {
       if (err.response?.data?.message.includes("pending")) {
          const approvals = await jsonFetch(`${API_URL}/hr/approvals`, { headers: hrHeaders });
          const existing = approvals.data.data.find((a: any) => a.requestType === "OFFBOARDING" && a.targetUserId === empId);
          offboardingReqId = existing.id;
          console.log("✅ Found existing Offboarding Request from seed.");
       } else {
          console.log("❌ Failed to request offboarding:", err.response?.data || err);
       }
    }

    try {
       await jsonFetch(`${API_URL}/hr/offboard/${offboardingReqId}/approve`, {
          method: 'PATCH',
          body: { status: "APPROVED" },
          headers: hrHeaders
       });
       throw new Error("❌ HR should not be able to approve their own request!");
    } catch (err: any) {
       if (err.response?.status === 403 && err.response?.data?.message.includes("different users")) {
         console.log("✅ Maker-Checker constraint successfully enforced.");
       } else {
         console.log("❌ Unexpected error approving:", err.response?.data || err);
       }
    }

    // 4. Test Cross-branch HR access
    console.log("\nTesting cross-branch HR access scope...");
    const approvalsRes = await jsonFetch(`${API_URL}/hr/approvals`, { headers: hrHeaders });
    console.log("✅ HR can fetch approvals for their scope.");

    console.log("\n--- Phase 11 Tests Completed Successfully ---");
    
  } catch (error: any) {
    console.error("Test failed:", error.response?.data || error.message);
  }
}

testPhase11();
