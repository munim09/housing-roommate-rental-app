import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIES } from "@/lib/session";

/**
 * Sign-out lives in a Route Handler rather than a `page.tsx` because deleting a
 * cookie is a response mutation — a Server Component is not allowed to set
 * headers, and `httpOnly` cookies cannot be cleared from the browser.
 *
 * Both verbs are served on purpose:
 *   - `POST` is what the header form submits, so sign-out works without JS.
 *   - `GET` makes `/logout` usable as a plain link (and survives a bookmark or
 *     a direct visit), which is what the redirect flow needs.
 */
async function logout(request: Request, redirectStatus: 303 | 307) {
  const cookieStore = await cookies();

  for (const name of Object.values(SESSION_COOKIES)) {
    cookieStore.delete(name);
  }

  // 303 after a POST so the browser follows up with a GET; 307 keeps a GET a GET.
  return NextResponse.redirect(new URL("/", request.url), redirectStatus);
}

export function GET(request: Request) {
  return logout(request, 307);
}

export function POST(request: Request) {
  return logout(request, 303);
}
