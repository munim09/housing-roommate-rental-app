import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ApiError, ApiErrorResponse, ApiResponse } from "@/types";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/api/v1";

export async function authedFetch(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  console.log("accessToken", accessToken);

  const base = API.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${base}${cleanPath}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
    credentials: "include",
  });

  console.log(res);

  return res;
}

/**
 * Typed wrapper around `authedFetch` for Server Component reads: it unwraps the
 * uniform envelope and throws a normalised `ApiError` so the nearest
 * `error.tsx` boundary catches API failures instead of rendering `undefined`.
 */
export async function authedFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await authedFetch(path, init);
  const payload = (await res.json().catch(() => null)) as
    | ApiResponse<T>
    | ApiErrorResponse
    | null;

  if (!res.ok || !payload || payload.success === false) {
    const failure = payload as ApiErrorResponse | null;

    throw {
      statusCode: failure?.statusCode ?? res.status,
      message:
        failure?.error?.message ??
        failure?.message ??
        "Something went wrong. Please try again.",
      errors: failure?.error?.errors,
    } satisfies ApiError;
  }

  return payload;
}
