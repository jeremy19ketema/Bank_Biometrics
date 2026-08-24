const http = require('http');

async function test() {
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "superadmin_real", passcode: "admin123" })
  });
  const loginData = await loginRes.json();
  console.log("Login:", loginData);

  const createRes = await fetch("http://localhost:5000/api/users", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + loginData.token
    },
    body: JSON.stringify({
      username: "testuser1",
      fullName: "Test User",
      email: "test@bank.com",
      password: "password123",
      role: "ACCOUNTANT",
      branchId: ""
    })
  });
  const createData = await createRes.json();
  console.log("Create:", createData);
}

test();
