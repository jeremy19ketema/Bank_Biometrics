import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const backendRes = await fetch("http://localhost:5000/api/auth/webauthn/auth-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    const data = await backendRes.json();
    
    if (!data.success) {
      return NextResponse.json({ success: false, message: data.message }, { status: 400 });
    }
    
    const { token, user } = data.data;
    
    const response = NextResponse.json({
      success: true,
      data: data.data
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
    return NextResponse.json({ success: false, message: "Verification failed." }, { status: 500 });
  }
}
