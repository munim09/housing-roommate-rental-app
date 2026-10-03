import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  CreatePropertyInput,
  OwnerDashboardStats,
  OwnerProperty,
} from "@/types";

/**
 * `GET /owner/dashboard` — owner only. Note this is not the admin stats route:
 * every count is scoped to the signed-in owner.
 */
export function getOwnerDashboard() {
  return apiClient<ApiResponse<OwnerDashboardStats>>("/owner/dashboard");
}

/**
 * `GET /owner/properties` — owner only.
 *
 * The route takes no query parameters: it answers with the owner's full list and
 * no `meta`, so the UI filters it itself and must not render server paging.
 */
export function getOwnerProperties() {
  return apiClient<ApiResponse<OwnerProperty[]>>("/owner/properties");
}

/** `POST /owner/properties` — owner only. Answers 201 with the created row. */
export function createProperty(payload: CreatePropertyInput) {
  return apiClient<ApiResponse<OwnerProperty>>("/owner/properties", {
    method: "POST",
    body: payload,
  });
}
