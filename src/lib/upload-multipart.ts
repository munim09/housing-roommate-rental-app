import { readAccessToken } from "@/lib/session";
import type { ApiError, ApiErrorResponse, ApiResponse } from "@/types";

export interface UploadProgress {
  /** Bytes of the request body the browser has sent so far. */
  loaded: number;
  /** Total body size, or `0` when the browser will not measure it. */
  total: number;
  /** `0`–`100`. Stays `0` while `total` is unknown. */
  percent: number;
}

export interface UploadMultipartOptions {
  /** Absolute backend URL, from `apiUrl`. */
  url: string;
  body: FormData;
  onProgress?: (progress: UploadProgress) => void;
}

/** Mirrors what `api-client` sends, so both transports are authenticated alike. */
function authHeaders() {
  const headers = new Headers();
  const token = readAccessToken();

  if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers;
}

function toUploadError(status: number, payload: unknown): ApiError {
  const failure = payload as ApiErrorResponse | null;

  return {
    statusCode: failure?.statusCode ?? status,
    message:
      failure?.error?.message ??
      failure?.message ??
      "Something went wrong. Please try again.",
    errors: failure?.error?.errors,
  };
}

/**
 * Posts a `multipart/form-data` body and reports how much of it has been sent.
 *
 * `ofetch` is built on `fetch`, which still cannot report upload progress — the
 * request body is a one-way stream with no events — so photo uploads go through
 * `XMLHttpRequest` instead. Everything else is deliberately identical to the rest
 * of the client: the same `Authorization` header, cookies via `withCredentials`,
 * and a rejection shaped like the `ApiError` that `toApiError` produces, so
 * callers can handle both transports the same way.
 *
 * Only browser uploads use this: `XMLHttpRequest` is touched inside the function,
 * never at module scope, so importing this from a Server Component (through the
 * `@/api` barrel, which also exports shared constants) is harmless. It is
 * deliberately left without a `"use client"` directive, because that directive
 * would turn every export of this module into a client reference for Server
 * Components that only want the endpoint module's constants.
 */
export function uploadMultipart<T>({
  url,
  body,
  onProgress,
}: UploadMultipartOptions): Promise<ApiResponse<T>> {
  return new Promise<ApiResponse<T>>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", url, true);
    // The access and refresh cookies are httpOnly and cross-origin here, so they
    // only ride along when the request opts in.
    request.withCredentials = true;

    for (const [name, value] of authHeaders()) {
      request.setRequestHeader(name, value);
    }

    if (onProgress) {
      request.upload.onprogress = (event) => {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: event.total
            ? Math.round((event.loaded / event.total) * 100)
            : 0,
        });
      };
    }

    request.onload = () => {
      const payload = safeJson(request.responseText);

      if (
        request.status >= 200 &&
        request.status < 300 &&
        !isFailure(payload)
      ) {
        resolve(payload as ApiResponse<T>);

        return;
      }

      reject(toUploadError(request.status, payload));
    };

    request.onerror = () => {
      reject(
        toUploadError(0, {
          message:
            "The upload could not reach the server. Check your connection.",
        }),
      );
    };

    request.onabort = () => {
      reject(toUploadError(0, { message: "Upload cancelled." }));
    };

    request.send(body);
  });
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** A 200 with `success: false` is still a failure, same as `authedFetchJson`. */
function isFailure(payload: unknown) {
  return (
    payload === null ||
    typeof payload !== "object" ||
    (payload as ApiResponse<unknown>).success === false
  );
}
