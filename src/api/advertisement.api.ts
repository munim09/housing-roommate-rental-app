import apiClient, { cleanParams } from "@/lib/api-client";
import type {
  ApiResponse,
  AvailableAdvertisement,
  AvailableAdvertisementQuery,
} from "@/types";

/**
 * `GET /available-advertisements` — public, no auth.
 * `areaId` is required by the backend, `to` must be after `from`, and
 * `rentalType` is the only optional filter.
 */
export function getAvailableAdvertisements(
  params: AvailableAdvertisementQuery,
) {
  return apiClient<ApiResponse<AvailableAdvertisement[]>>(
    "/available-advertisements",
    { params: cleanParams(params) },
  );
}

/** `GET /available-advertisements/:advertisementId` — public listing detail. */
export function getAvailableAdvertisement(advertisementId: string) {
  return apiClient<ApiResponse<AvailableAdvertisement>>(
    `/available-advertisements/${advertisementId}`,
  );
}
