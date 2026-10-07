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
