/**
 * Uniform response envelope returned by every B7A7 backend endpoint.
 * Errors come back with `success: false` and an `error` object instead.
 */
export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Meta;
}

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export type QueryParamValue = string | number | boolean | undefined | null;

/**
 * Loose bag for query strings. Call sites pass their own typed param object
 * (e.g. `AreaQuery`), so this is only used for the cleaned output ofetch sends.
 */
export type QueryParams = Record<string, QueryParamValue>;
