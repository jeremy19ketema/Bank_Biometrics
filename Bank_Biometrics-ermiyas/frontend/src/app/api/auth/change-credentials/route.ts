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

    // Get the current user from cookies
    const userCookie = request.cookies.get("aegis_user")?.value;
    if (!userCookie) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const currentUser = JSON.parse(userCookie);

    // In a real app, this would:
    // 1. Verify current passcode against DB hash
    // 2. Check new username availability
    // 3. Hash new passcode and update
    // 4. Update isFirstLogin to false
    // 5. Generate new token

    // Mock implementation - update the user in cookies
    const updatedUser = {
      ...currentUser,
      username: newUsername || currentUser.username,
      isFirstLogin: false,
      status: "ACTIVE",
    };

    const newToken = Buffer.from(`${currentUser.id}:${Date.now()}:updated`).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Credentials updated successfully",
      token: newToken,
      user: updatedUser,
      redirect: "/super-admin",
    });

    // Update cookies with new token and user data (clearing firstLogin)
    response.cookies.set("aegis_auth_token", newToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.set("aegis_user", JSON.stringify(updatedUser), {
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

