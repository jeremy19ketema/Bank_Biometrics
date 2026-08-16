import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { newUsername, currentPasscode, newPasscode } = await request.json();

    // Validate input
    if (!currentPasscode || !newPasscode) {
      return NextResponse.json(
        { success: false, message: "Current and new passcodes are required" },
        { status: 400 }
      );
    }

    if (newPasscode.length < 6) {
      return NextResponse.json(
        { success: false, message: "New passcode must be at least 6 characters" },
        { status: 400 }
      );
    }

    const token = request.cookies.get("aegis_auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const backendRes = await fetch("http://localhost:5000/api/auth/complete-first-login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ newUsername, currentPasscode, newPasscode }),
    });

    const data = await backendRes.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to update credentials." },
        { status: backendRes.status }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: data.message || "Credentials updated successfully",
      token: data.token,
      user: data.user,
    });

    // Update cookies with new token and user data (clearing firstLogin)
    response.cookies.set("aegis_auth_token", data.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("aegis_user", JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Service unavailable." },
      { status: 500 }
    );
  }
}

