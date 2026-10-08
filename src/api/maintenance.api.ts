import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  MaintenancePriority,
  MaintenanceRequest,
  MaintenanceStatus,
} from "@/types";

/** Body of `POST /tenant/maintenance-requests` (see `req-res/api.txt`). */
export interface CreateMaintenanceRequestInput {
  stayId: string;
  issue: string;
  description?: string;
  priority: MaintenancePriority;
}

/**
 * Body of `PATCH /manager/maintenance-requests/:requestId` — every field is
 * optional, so the form only sends the ones the operator actually changed.
 * Timestamps arrive as ISO strings (`Date` in the backend interface).
 */
export interface UpdateMaintenanceRequestInput {
  status?: MaintenanceStatus;
  scheduledFor?: string;
  resolvedAt?: string;
}

/**
 * `GET /tenant/maintenance-requests` — every request this tenant reported,
 * newest data first, with the stay and reporter relations attached.
 */
export function getMaintenanceRequests() {
  return apiClient<ApiResponse<MaintenanceRequest[]>>(
    "/tenant/maintenance-requests",
  );
}

/**
 * `POST /tenant/maintenance-requests` — reports a problem on a stay. The
 * backend only accepts it once the stay has started (`CONFIRMED`), so callers
 * gate the form on that status first.
 */
export function createMaintenanceRequest(body: CreateMaintenanceRequestInput) {
  return apiClient<ApiResponse<MaintenanceRequest>>(
    "/tenant/maintenance-requests",
    { method: "POST", body },
  );
}

/**
 * `PATCH /manager/maintenance-requests/:requestId` — OWNER and MANAGER move a
 * request through its lifecycle: change `status`, schedule the visit and stamp
 * the resolution time. The tenant surface has no write access to this route.
 */
export function updateMaintenanceRequest(
  requestId: string,
  body: UpdateMaintenanceRequestInput,
) {
  return apiClient<ApiResponse<MaintenanceRequest>>(
    `/manager/maintenance-requests/${requestId}`,
    { method: "PATCH", body },
  );
}
