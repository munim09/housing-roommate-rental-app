import type { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtUtils } from "@/app/utils/jwt";
import { getNewAccessToken } from "@/app/utils/refreshToken";
import type { UserRole } from "@/types";

const AUTH_ROUTES = ["/login", "/register", "/verify-email"];
// `/logout` is public so signing out never bounces an anonymous visitor to
// `/login?from=/logout` — the handler clears nothing and redirects home anyway.
const PUBLIC_ROUTES = ["/", "/listings", "/about", "/contact", "/logout"];

const ADMIN_ROUTES = ["/admin", "/manage-areas"];

const OWNER_ROUTES = ["/owner"];

/**
 * Surfaces that only one role may open. `/manage-areas` sits outside `/admin`
 * because it is its own route, so both admin prefixes are listed explicitly.
 */
const ROLE_GATED_ROUTES: { prefixes: string[]; role: UserRole }[] = [
  { prefixes: ADMIN_ROUTES, role: "ADMIN" },
  { prefixes: OWNER_ROUTES, role: "OWNER" },
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let accessToken =
    request.cookies.get("accessToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const refreshToken = request.cookies.get("refreshToken")?.value;

  ////////For Opencode: DO not delete
  const cookieStore = await cookies();

  let decodedAccessToken = accessToken
    ? jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
    : null;

  const decodedRefreshToken = refreshToken
    ? jwtUtils.verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      )
    : null;

  if (!decodedAccessToken?.success && decodedRefreshToken?.success) {
    //access token has expired but refresh token is valid, get new access token from backend
    const result = await getNewAccessToken();

    if (result.success) {
      const newAccessToken = result.data.accessToken;

      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
      });

      accessToken = newAccessToken;
      decodedAccessToken = jwtUtils.verifyToken(
        accessToken!,
        process.env.JWT_ACCESS_SECRET as string,
      );
    } else {
      cookieStore.delete("refreshToken");
    }
  }

  let userRole = null;

  if (!decodedAccessToken?.success) {
    //token has expired or is invalid, clear the cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("authUser");
  }

  if (decodedAccessToken?.success && decodedAccessToken.data) {
    userRole = (decodedAccessToken.data as JwtPayload).role;
  }
  ///////////////////////////// End ///

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const requiredRole = ROLE_GATED_ROUTES.find((entry) =>
    matchesPrefix(pathname, entry.prefixes),
  )?.role;

  if (!accessToken && !refreshToken && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && isAuthRoute) {
    const from = request.nextUrl.searchParams.get("from") || "/dashboard";
    return NextResponse.redirect(new URL(from, request.url));
  }

  if (requiredRole && accessToken) {
    try {
      const userCookie = request.cookies.get("authUser")?.value;
      if (userCookie) {
        const user = JSON.parse(userCookie) as { role?: UserRole };
        if (user.role && user.role !== requiredRole) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch {
      // A malformed cookie cannot be read here, but each route group's layout
      // re-checks the role and will redirect on its own.
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // '/dashboard/:path*',
    // '/admin-dashboard/:path*',
    "/((?!api|_next/static|favicon.ico|_next/image|.*\\.png$).*)",
  ],
};
