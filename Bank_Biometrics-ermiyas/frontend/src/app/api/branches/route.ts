import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";

    const backendResponse = await fetch(`${BACKEND_URL}/api/branches`, {
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to load branches." },
      { status: 500 }
    );
  }
}
