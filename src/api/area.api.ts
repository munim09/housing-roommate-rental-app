import apiClient, { cleanParams } from "@/lib/api-client";
import type { ApiResponse, Area, AreaQuery } from "@/types";

/** `GET /areas` — public, no auth. Requires `areaId` filtering downstream. */
export function getAreas(params: AreaQuery) {
  return apiClient<ApiResponse<Area[]>>("/areas", {
    params: cleanParams(params),
  });
}
