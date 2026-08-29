import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, passcode } = await request.json();

    // Strict RBAC mock users - each has specific credentials
    // KEPT FOR REFERENCE AS REQUESTED
    type MockUser = {
      id: string;
      username: string;
      passcode: string;
      fullName: string;
      email: string;
      role: "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER" | "SUPER_ADMIN_IT" | "SUPER_ADMIN_FOREX" | "BANK_MANAGER" | "BRANCH_IT" | "ACCOUNTANT" | "HR";
      branchId?: string;
      branchName?: string;
      department?: string;
      avatarUrl: string;
      isFirstLogin?: boolean;
    };

    const redirectMap: Record<string, string> = {
      SUPER_ADMIN: "/super-admin",
      SUPER_ADMIN_MANAGER: "/internal-manager",
      SUPER_ADMIN_IT: "/it",
      SUPER_ADMIN_FOREX: "/forex",
      BANK_MANAGER: "/manager",
      BRANCH_IT: "/it",
      ACCOUNTANT: "/accountant",
      HR: "/hr-dash"
    };

    const mockUsers: MockUser[] = [
      {
        id: "sa-1",
        username: "superadmin",
        passcode: "admin123",
        fullName: "Sarah Jenkins",
        email: "s.jenkins@aegisbank.eth",
        role: "SUPER_ADMIN",
        isFirstLogin: false,
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCXTUK5oMrCSCAuuUvhcMQqBcRqi_Ak-tWCfX2nF9jxfXaJyq7n_IAQUQNMKqpf4nH1BqpRgr2vU4r7FpbC0nvFqnRRDGf9nUzUoziScmLWIDGfkXG8KoF4DYpIetyZZ3WWgmPRm98lyIagMK3XQDaruSpuysFVLd-ISLYbvcKxAECDLvpa0kLCzHP2wMP4fPevBjWv-0KtyYeEYbJfyRiRu3aKF7DpO1mpQqN6m_-PhirYz-6A7o5w7g",
      },
      {
        id: "sam-1",
        username: "superadminmanager",
        passcode: "sam123",
        fullName: "Elena Rostova",
        email: "e.rostova@aegisbank.eth",
        role: "SUPER_ADMIN_MANAGER",
        isFirstLogin: false,
        department: "Operations Oversight",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBc-b2-LuHimZXMXqyzU0qr21DrSdQInRriI0OUfxrmciJDd8K3rax00q2ou9PEqN15veVFEQu219B7QU0K4g2Pz2S34dn1I6HhA7pcMryaAcKaZjdqoCi0i7UtKGbNGrH2-PIB46BoTZu9oJvv4wbIaiBI7khbzKM_HL-azMK08DPb6RtPzqgbXCLEHJsMV9erB78lOl5YYBTc-yUW7CKJcYsfWyhTydwpbQiWaX4l5ufTUd1dmrjTrw",
      },
      {
        id: "sait-1",
        username: "superadminit",
        passcode: "sait123",
        fullName: "Solomon Tesfaye",
        email: "s.tesfaye@aegisbank.eth",
        role: "SUPER_ADMIN_IT",
        isFirstLogin: false,
        department: "Infrastructure & Security",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDgk2LZzrchzP37J-BqoEWu00TyD3Q9J6xkFkBSMTEA6uAdp3ndye2-1i1_vI27jpJxRuCyzbeTKVDy_HiqcPljkOeJ6AX90Vm7v_BEMyOteleSyxugcBPq3C6T5eSyhDO4Lr8WyfLOQ1iTgsOHOYCLhrKHzIDZM5ECUohhFze0ne8mwn4ySWw6eaCW53DSSzxd7yNMRkeearYdpibQlk5UG72NwrZsnkiSl07bkAf9zdBWIwmgMHNLUg",
      },
      {
        id: "safx-1",
        username: "superadminforex",
        passcode: "safx123",
        fullName: "Tigist Kebede",
        email: "t.kebede@aegisbank.eth",
        role: "SUPER_ADMIN_FOREX",
        isFirstLogin: false,
        department: "Currency Exchange",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDBPBvdaB33vhwc7-RKZCTFZqO0q8MBerQj0VIHDFzDP_AKBwTBhYhj4XXRfkwf4-zbHNr12cOFovYoobY_U4RKtAuzDm-IZ6WksoE48skAJFx9oygmdm2scL_Vq6V209SbBcRDdLgELDwwLNnh7MHZ9kQMpu2mm4IkMVR3i4ec_3a4ZVLdSEMGwlmIIjwkl77x1C1iMjmpldUzIl5tzAvAXyfiI66V4C6PT_hO5Le1lKL-JrpC5TZjoQ",
      },
      {
        id: "mgr-1",
        username: "branchmanager",
        passcode: "mgr123",
        fullName: "David Chen",
        email: "d.chen@aegisbank.eth",
        role: "BANK_MANAGER",
        isFirstLogin: false,
        branchId: "br-1",
        branchName: "Canary Wharf Branch",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDvApie-L3UC1FWJNUKT_W8Zu2icAg0n0Y5MWV2IOFsOOyGKYyjZB3dOcQKUH8zt7Ga6Yc8CwEcRHPh0JsezRugl3PfeRWV9ONl0WNZt8D_J9ip16lylLDJs_Ug47m25YuYn2e_yl34CfMEAvSPrFwy9FoD1Wrc1XxHRwFRNqwf60oVt_lLU2WD_oQJGmeOcgMCQnRTqKwWIcBGbrG7jBSTZnvaUlVi53IPugwhhTV4N-VvtKZIAYOIiw",
      },
      {
        id: "bit-1",
        username: "branchit",
        passcode: "bit123",
        fullName: "Mulugeta Haile",
        email: "m.haile@aegisbank.eth",
        role: "BRANCH_IT",
        isFirstLogin: false,
        branchId: "br-1",
        branchName: "Canary Wharf Branch",
        department: "Biometric Systems",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDgk2LZzrchzP37J-BqoEWu00TyD3Q9J6xkFkBSMTEA6uAdp3ndye2-1i1_vI27jpJxRuCyzbeTKVDy_HiqcPljkOeJ6AX90Vm7v_BEMyOteleSyxugcBPq3C6T5eSyhDO4Lr8WyfLOQ1iTgsOHOYCLhrKHzIDZM5ECUohhFze0ne8mwn4ySWw6eaCW53DSSzxd7yNMRkeearYdpibQlk5UG72NwrZsnkiSl07bkAf9zdBWIwmgMHNLUg",
      },
      {
        id: "acc-1",
        username: "accountant",
        passcode: "acc123",
        fullName: "Jane Doe",
        email: "j.doe@aegisbank.eth",
        role: "ACCOUNTANT",
        isFirstLogin: false,
        branchId: "br-2",
        branchName: "Bole Diplomatic Branch",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDBPBvdaB33vhwc7-RKZCTFZqO0q8MBerQj0VIHDFzDP_AKBwTBhYhj4XXRfkwf4-zbHNr12cOFovYoobY_U4RKtAuzDm-IZ6WksoE48skAJFx9oygmdm2scL_Vq6V209SbBcRDdLgELDwwLNnh7MHZ9kQMpu2mm4IkMVR3i4ec_3a4ZVLdSEMGwlmIIjwkl77x1C1iMjmpldUzIl5tzAvAXyfiI66V4C6PT_hO5Le1lKL-JrpC5TZjoQ",
      },
      // First login mock user - shows the forced credential change flow
      {
        id: "new-1",
        username: "newuser",
        passcode: "temp123",
        fullName: "New Employee",
        email: "new.employee@aegisbank.eth",
        role: "ACCOUNTANT",
        isFirstLogin: true,
        branchId: "br-2",
        branchName: "Bole Diplomatic Branch",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDBPBvdaB33vhwc7-RKZCTFZqO0q8MBerQj0VIHDFzDP_AKBwTBhYhj4XXRfkwf4-zbHNr12cOFovYoobY_U4RKtAuzDm-IZ6WksoE48skAJFx9oygmdm2scL_Vq6V209SbBcRDdLgELDwwLNnh7MHZ9kQMpu2mm4IkMVR3i4ec_3a4ZVLdSEMGwlmIIjwkl77x1C1iMjmpldUzIl5tzAvAXyfiI66V4C6PT_hO5Le1lKL-JrpC5TZjoQ",
      },
      {
        id: "hr-1",
        username: "hr_admin",
        passcode: "hrpass123",
        fullName: "HR Administrator",
        email: "hr@bank.com",
        role: "HR",
        isFirstLogin: false,
        department: "Human Resources",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDBPBvdaB33vhwc7-RKZCTFZqO0q8MBerQj0VIHDFzDP_AKBwTBhYhj4XXRfkwf4-zbHNr12cOFovYoobY_U4RKtAuzDm-IZ6WksoE48skAJFx9oygmdm2scL_Vq6V209SbBcRDdLgELDwwLNnh7MHZ9kQMpu2mm4IkMVR3i4ec_3a4ZVLdSEMGwlmIIjwkl77x1C1iMjmpldUzIl5tzAvAXyfiI66V4C6PT_hO5Le1lKL-JrpC5TZjoQ",
      },
    ];

    // Instead of using mockUsers, proxy to real backend:
    const backendRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, passcode })
    });

    const data = await backendRes.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Invalid credentials." },
        { status: 401 }
      );
    }

    const { token, user, isFirstLogin, requiresRegistration, requires2FA, userId, message } = data;

    // If WebAuthn is required, forward that to the frontend immediately
    if (requiresRegistration || requires2FA) {
      return NextResponse.json({
        success: true,
        requiresRegistration,
        requires2FA,
        userId,
        message
      });
    }

    // Determine redirect
    const redirect = isFirstLogin ? "/change-credentials" : redirectMap[user.role] || "/super-admin";

    const response = NextResponse.json({
      success: true,
      token,
      user,
      isFirstLogin: isFirstLogin || false,
      redirect,
    });

    // Set cookies for middleware
    response.cookies.set("aegis_auth_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    response.cookies.set("aegis_user", JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Authentication service unavailable." },
      { status: 500 }
    );
  }
}



