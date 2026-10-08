"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateMaintenanceRequestInput,
  createMaintenanceRequest,
  getMaintenanceRequests,
  type UpdateMaintenanceRequestInput,
  updateMaintenanceRequest,
} from "@/api/maintenance.api";
import { toApiError } from "@/lib/api-client";
import type { ApiError, ApiResponse, MaintenanceRequest } from "@/types";

export const maintenanceKeys = {
  all: ["maintenance-requests"] as const,
  byStay: (stayId: string) =>
    ["maintenance-requests", "by-stay", stayId] as const,
};

/**
 * `GET /tenant/maintenance-requests` — the endpoint returns every request the
 * tenant reported across all stays, so the rows are narrowed to the requested
 * stay before they reach the UI. Keeps each stay's list independently cached
 * while `maintenanceKeys.all` still invalidates them all in one shot.
 */
export function useMaintenanceRequestsByStay(stayId: string, enabled = true) {
  return useQuery<MaintenanceRequest[], ApiError>({
    queryKey: maintenanceKeys.byStay(stayId),
    enabled: enabled && Boolean(stayId),
    retry: false,
    queryFn: async () => {
      try {
        const response = await getMaintenanceRequests();
        const requests = response.data ?? [];
        return requests.filter((request) => request.stayId === stayId);
      } catch (error) {
        throw toApiError(error);
      }
    },
  });
}

/**
 * `POST /tenant/maintenance-requests` — reports a new problem on a stay.
 * Every cached maintenance list is refetched so the new request shows up
 * without a manual reload.
 */
export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<MaintenanceRequest>,
    ApiError,
    CreateMaintenanceRequestInput
  >({
    mutationFn: async (body) => {
      try {
        return await createMaintenanceRequest(body);
      } catch (error) {
        throw toApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}

/**
 * `PATCH /manager/maintenance-requests/:requestId` — moves a request through
 * its lifecycle. Invalidates every cached maintenance list so both the owner /
 * manager table and the tenant's own view reflect the new state immediately.
 */
export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<MaintenanceRequest>,
    ApiError,
    { requestId: string; body: UpdateMaintenanceRequestInput }
  >({
    mutationFn: async ({ requestId, body }) => {
      try {
        return await updateMaintenanceRequest(requestId, body);
      } catch (error) {
        throw toApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    },
  });
}
