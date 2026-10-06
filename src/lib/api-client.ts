import { ofetch } from "ofetch";
import { readAccessToken } from "@/lib/session";
import type {
  ApiError,
  ApiErrorBody,
  QueryParams,
  QueryParamValue,
} from "@/types";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1";

/**
 * Every backend route lives under `/api/v1`, so the prefix is joined here once
 * and call sites stay clean. `credentials: "include"` lets the httpOnly access
 * and refresh cookies ride along automatically, while the Bearer header covers
 * the cases where the browser drops those cookies.
 */
export const apiClient = ofetch.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  credentials: "include",
  retry: 0,
  onRequest({ options }) {
    const token = readAccessToken();
    const headers = new Headers(options.headers);
    console.log("token", token);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    options.headers = headers;
  },
});

/**
 * Absolute URL for a backend path.
 *
 * Needed by the handful of calls that cannot go through `apiClient` — currently
 * the multipart uploader, which needs `XMLHttpRequest` to report progress. Both
 * prefix pieces are joined here so that call cannot drift from `baseURL`.
 */
export function apiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${BASE_URL}${API_PREFIX}${cleanPath}`;
}

/** Normalises anything thrown by ofetch into a predictable shape for toasts. */
export function toApiError(error: unknown): ApiError {
  if (error && typeof error === "object") {
    const candidate = error as {
      statusCode?: number;
      status?: number;
      data?: ApiErrorBody;
      message?: string;
    };

    return {
      statusCode: candidate.statusCode ?? candidate.status ?? 500,
      message:
        candidate.data?.message ??
        candidate.message ??
        "Something went wrong. Please try again.",
      errors: candidate.data?.errors,
    };
  }

  return {
    statusCode: 500,
    message: "Something went wrong. Please try again.",
  };
}

/** Drops empty values so ofetch never sends `?from=&to=`. */
export function cleanParams<T extends object>(params?: T): QueryParams {
  if (!params) return {};

  return Object.fromEntries(
    Object.entries(params as Record<string, QueryParamValue>).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export default apiClient;
