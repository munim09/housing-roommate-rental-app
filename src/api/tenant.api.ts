import apiClient from "@/lib/api-client";
import { authedFetchJson } from "@/lib/auth-fetched";
import type {
  ApiResponse,
  ApplicationAdvertisementRef,
  ApplicationStayRecord,
  StayApplicationRef,
} from "@/types";

export interface TenantApplication {
  id: string;
  rentalType?: string;
  status: string;
  requestedStartDate?: string;
  requestedEndDate?: string;
  note?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  advertisement?: ApplicationAdvertisementRef | null;
  /** Attached once the application is approved. */
  stay?: ApplicationStayRecord | null;
}

export interface TenantStay {
  id: string;
  applicationId?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  monthlyRent?: string | number;
  application?: StayApplicationRef | null;
}

/** Unwraps the `{ success, data }` envelope the backend uses everywhere. */
function rowsOf<T>(response: ApiResponse<T[]> | undefined): T[] {
  return Array.isArray(response?.data) ? response.data : [];
}

export async function getTenantApplications(params?: {
  page?: number;
  limit?: number;
}): Promise<TenantApplication[]> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";

  const response = await authedFetchJson<ApiResponse<TenantApplication[]>>(
    `/tenant/applications${query}`,
  );
  return rowsOf(response);
}

export async function getTenantApplication(applicationId: string) {
  return authedFetchJson(`/tenant/applications/${applicationId}`);
}

export async function getTenantStays(): Promise<TenantStay[]> {
  const response =
    await authedFetchJson<ApiResponse<TenantStay[]>>("/tenant/stays");
  return rowsOf(response);
}

export function updateTenantApplicationStatus(
  applicationId: string,
  status: string,
) {
  return apiClient<ApiResponse<null>>(`/tenant/applications/${applicationId}`, {
    method: "PATCH",
    body: { status },
  });
}

export interface CreateTenantApplicationInput {
  advertisementId: string;
  requestedStartDate: string;
  requestedEndDate: string;
  note?: string;
}

/**
 * `POST /tenant/applications` — a tenant applies for an available
 * advertisement. The 201 response echoes the created row (PENDING) with a
 * trimmed `advertisement` reference.
 */
export function createTenantApplication(body: CreateTenantApplicationInput) {
  return apiClient<ApiResponse<TenantApplication>>("/tenant/applications", {
    method: "POST",
    body,
  });
}
