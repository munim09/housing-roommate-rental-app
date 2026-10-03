import type { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtUtils } from "@/app/utils/jwt";
import { getNewAccessToken } from "@/app/utils/refreshToken";
import { roleHome } from "@/lib/server-session";
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
  ///////////////////////////// End ///

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

  if (!decodedAccessToken?.success) {
    // The cookie is expired, forged or corrupt. Clearing it stops every later
    // request from carrying it, and `hasValidAccess` makes the routing below
    // treat the visitor as signed out.
    cookieStore.delete("accessToken");
    cookieStore.delete("authUser");
  }

  /**
   * Authorisation is driven by the *verified* token, never by the `authUser`
   * cookie — that cookie is written by the browser with `document.cookie`, so it
   * is not httpOnly and anyone can rewrite it. Using the signed claims here is
   * what stops a tenant hand-setting `authUser={"role":"OWNER"}`.
   */
  const hasValidAccess = Boolean(decodedAccessToken?.success);
  const userRole =
    decodedAccessToken?.success && decodedAccessToken.data
      ? (decodedAccessToken.data as JwtPayload).role
      : null;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const requiredRole = ROLE_GATED_ROUTES.find((entry) =>
    matchesPrefix(pathname, entry.prefixes),
  )?.role;

  // An unusable token counts as signed out. Deciding on the raw cookie instead
  // let a corrupt token through to render a route's loading skeleton.
  const signedIn = hasValidAccess || Boolean(decodedRefreshToken?.success);

  if (!signedIn && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasValidAccess && isAuthRoute) {
    // `from` is where the visitor was originally headed. Without it, fall back to
    // the role's own landing page — the old `/dashboard` default is not a route
    // in this app, so it produced a 404 for every signed-in user.
    const from = request.nextUrl.searchParams.get("from");

    const destination = from
      ? // Only same-origin paths, so `?from=` cannot be used as an open redirect.
        from.startsWith("/") && !from.startsWith("//")
        ? from
        : roleHome(userRole as UserRole)
      : roleHome(userRole as UserRole);

    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (requiredRole && signedIn) {
    if (!hasValidAccess) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== requiredRole) {
      return NextResponse.redirect(new URL("/", request.url));
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
