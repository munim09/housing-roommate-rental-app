import apiClient from "@/lib/api-client";
import type { ApiResponse, StayRecord } from "@/types";

/**
 * `GET /tenant/stays` — allowed for `TENANT`, `OWNER` and `MANAGER`. The list
 * is not paginated, so one call feeds the application detail drawer: an
 * application points at its stay through `stay.id`.
 */
export function getStays() {
  return apiClient<ApiResponse<StayRecord[]>>("/tenant/stays");
}
