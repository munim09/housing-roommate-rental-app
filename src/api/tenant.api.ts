import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types";

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
  advertisement?: any;
}

export interface TenantStay {
  id: string;
  applicationId?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  monthlyRent?: string | number;
  application?: any;
}

export function getTenantApplications(params?: {
  page?: number;
  limit?: number;
}) {
  return apiClient<ApiResponse<TenantApplication[]>>("/tenant/applications", {
    params,
  });
}

export function updateTenantApplicationStatus(
  applicationId: string,
  status: string,
) {
  return apiClient<ApiResponse<TenantApplication>>(
    `/tenant/applications/${applicationId}`,
    {
      method: "PATCH",
      body: { status },
    },
  );
}

export function getTenantStays() {
  return apiClient<ApiResponse<TenantStay[]>>("/tenant/stays");
}
