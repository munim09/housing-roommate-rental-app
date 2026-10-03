import type { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { jwtUtils } from "@/app/utils/jwt";
import type { UserRole } from "@/types";

export interface SessionClaims {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

/** The backend's own roles. Anything else in the token is treated as untrusted. */
const ROLES: UserRole[] = ["ADMIN", "OWNER", "MANAGER", "TENANT"];

/**
 * Reads the `accessToken` cookie and returns its **verified** claims, or `null`.
 *
 * Server-side authorization must come from the signed token, never from the
 * `authUser` cookie. That cookie is a mirror the browser writes with
 * `document.cookie` (see `src/lib/session.ts`), so it is not httpOnly and any
 * visitor can rewrite it — trusting it meant a tenant could hand-edit
 * `authUser={"role":"OWNER"}` and render every `/owner` page.
 *
 * The signature is checked with the same secret `src/proxy.ts` uses, and the
 * role is checked against the backend's own enum, so a forged *or* badly signed
 * token cannot widen access.
 */
export async function getSessionClaims(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  const verified = jwtUtils.verifyToken(
    token,
    process.env.JWT_ACCESS_SECRET as string,
  );

  if (!verified.success) return null;

  const payload = verified.data as JwtPayload & Partial<SessionClaims>;

  if (typeof payload.userId !== "string") return null;
  if (!ROLES.includes(payload.role as UserRole)) return null;

  return {
    userId: payload.userId,
    email: typeof payload.email === "string" ? payload.email : "",
    name: typeof payload.name === "string" ? payload.name : "",
    role: payload.role as UserRole,
  };
}

/**
 * Only ADMIN and OWNER have a surface in this app so far. `ROLE_HOME` also lists
 * `/manager/dashboard` and `/tenant/dashboard`, which would 404, so an
 * unauthorised visitor is sent to the public landing page instead.
 */
export function roleHome(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "OWNER":
      return "/owner/dashboard";
    default:
      return "/";
  }
}
