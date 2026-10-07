import apiClient, { cleanParams } from "@/lib/api-client";
import type { ApiResponse, OwnerManagerApplication } from "@/types";

export interface OwnerManagerApplicationsQuery {
  page?: number;
  limit?: number;
}

/**
 * `GET /manager/applications` — every application the signed-in owner or
 * manager may review, newest first. There is no `advertisementId` filter on
 * the server, so callers page through the list and filter client-side.
 */
export function getOwnerManagerApplications(
  params?: OwnerManagerApplicationsQuery,
) {
  return apiClient<ApiResponse<OwnerManagerApplication[]>>(
    "/manager/applications",
    { params: cleanParams(params ?? {}) },
  );
}

/**
 * `PATCH /tenant/applications/:id` — owners and managers move a pending
 * application to `APPROVED` (a stay record is created) or `REJECTED`;
 * tenants may only withdraw their own.
 */
export function updateApplicationStatus(
  applicationId: string,
  status: "APPROVED" | "REJECTED" | "WITHDRAWN",
) {
  return apiClient<ApiResponse<OwnerManagerApplication | null>>(
    `/tenant/applications/${applicationId}`,
    { method: "PATCH", body: { status } },
  );
}
