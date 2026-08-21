import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/forgot-password", "/api/auth/login", "/change-credentials"];

// Role-based route permissions
const routePermissions: Record<string, string[]> = {
  "/super-admin": ["SUPER_ADMIN"],
  "/internal-manager": ["SUPER_ADMIN_MANAGER", "SUPER_ADMIN"],
  "/it": ["SUPER_ADMIN_IT", "BRANCH_IT", "IT_SUPPORT", "SUPER_ADMIN"],
  "/forex": ["SUPER_ADMIN_FOREX", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN"],
  "/forex/users": ["SUPER_ADMIN_MANAGER", "SUPER_ADMIN"], 
  "/manager": ["BANK_MANAGER", "SUPER_ADMIN"],
  "/hr": ["HR", "SUPER_ADMIN"],
  "/accountant": ["ACCOUNTANT", "SUPER_ADMIN"],
  "/users": ["SUPER_ADMIN"],
  "/it-users": ["SUPER_ADMIN_IT", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN"], // ✅ Added SUPER_ADMIN_MANAGER
};

// Fallback dashboard for each role (used only if we need to redirect)
// But we will redirect to /access-denied instead
const roleDashboard: Record<string, string> = {
  SUPER_ADMIN: "/super-admin",
  SUPER_ADMIN_MANAGER: "/internal-manager",
  SUPER_ADMIN_IT: "/it",
  SUPER_ADMIN_FOREX: "/forex",
  BANK_MANAGER: "/manager",
  HR: "/hr",
  BRANCH_IT: "/it",
  IT_SUPPORT: "/it",
  ACCOUNTANT: "/accountant",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Get auth token and user from cookies
  const token = request.cookies.get("aegis_auth_token")?.value;
  const userCookie = request.cookies.get("aegis_user")?.value;

  // 3a. No token – redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3b. No user cookie – clear token and redirect to login
  if (!userCookie) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("aegis_auth_token");
    return response;
  }

  // 4. Parse user from cookie
  let user;
  try {
    user = JSON.parse(userCookie);
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("aegis_auth_token");
    response.cookies.delete("aegis_user");
    return response;
  }

  const role = user.role;

  // 5. Check if the current path requires a specific role
  let isAllowed = false;
  let matchedRoute = "";

  for (const [route, roles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      matchedRoute = route;
      if (roles.includes(role)) {
        isAllowed = true;
        break;
      }
    }
  }

  // 6. If the path is a known dashboard/route and the user is not allowed
  if (matchedRoute && !isAllowed) {
    // 🆕 Redirect to the dedicated 403 page
    const accessDeniedUrl = new URL("/access-denied", request.url);
    // Optionally add a message or the attempted path
    accessDeniedUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(accessDeniedUrl);
  }

  // 7. Allow all other paths (or you can add more restrictions)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};