import fetch from "node-fetch";

async function runTests() {
  console.log("=== Running Forbidden Cases Tests ===\n");

  // 1. Login as SUPER_ADMIN
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "superadmin_real", passcode: "admin123" })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  if (!token) {
    console.error("Failed to login as SUPER_ADMIN. Make sure seeder has run.");
    return;
  }

  // 2. Setup Data: Org, Region, Branch, Role, User
  const ts = Date.now();
  
  const orgRes = await fetch("http://localhost:5000/api/org/organizations", {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ name: `Test Org ${ts}`, code: `ORG_${ts}` })
  });
  const org = (await orgRes.json()).data;

  const regRes = await fetch("http://localhost:5000/api/org/regions", {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ name: `Test Reg ${ts}`, code: `REG_${ts}`, organizationId: org.id })
  });
  const region = (await regRes.json()).data;

  const roleRes = await fetch("http://localhost:5000/api/roles/custom", {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ name: `Test Role ${ts}`, description: "Test" })
  });
  const role = (await roleRes.json()).data;

  console.log(`Created Org: ${org.id}, Region: ${region.id}, Role: ${role.id}`);

  // Test Case A: Assign Branch role with a Region ID
  console.log("\n[Test A] Assigning BRANCH role with a REGION ID...");
  const assignFailRes = await fetch("http://localhost:5000/api/roles/assign", {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ userId: loginData.user.id, customRoleId: role.id, scopeType: "BRANCH", scopeId: region.id })
  });
  const assignFail = await assignFailRes.json();
  if (!assignFail.success && assignFail.message.includes("does not exist")) {
    console.log("✅ Passed: System successfully rejected Branch assignment with Region ID.");
  } else {
    console.error("❌ Failed:", assignFail);
  }

  // Check audit logs for the rejection
  const auditRes = await fetch("http://localhost:5000/api/audit/logs", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const auditLogs = await auditRes.json();
  const lastLog = auditLogs.data.data[0];
  if (lastLog.action === "ROLE_ASSIGN_REJECTED" && lastLog.status === "WARNING") {
    console.log("✅ Passed: Rejection was successfully audit-logged.");
  } else {
    console.error("❌ Failed to log rejection:", lastLog);
  }

  console.log("\n=== Tests Completed ===");
}

runTests();
