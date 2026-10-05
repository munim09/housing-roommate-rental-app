import apiClient, { cleanParams } from "@/lib/api-client";
import type {
  Advertisement,
  ApiResponse,
  AvailableAdvertisement,
  AvailableAdvertisementQuery,
} from "@/types";

export interface CreateAdvertisementInput {
  title: string;
  description?: string;
  monthlyRent: number | string;
  availableFrom: string;
  availableTo: string;
}

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

/** `GET /owner/advertisements` — owner/manager can view their advertisements */
export function getMyAdvertisements() {
  return apiClient<ApiResponse<Advertisement[]>>("/owner/advertisements");
}

/** `POST /advertisements/flats/:flatId` */
export function createFlatAdvertisement(flatId: string, body: CreateAdvertisementInput) {
  return apiClient<ApiResponse<Advertisement>>(`/advertisements/flats/${flatId}`, {
    method: "POST",
    body,
  });
}

/** `POST /advertisements/rooms/:roomId` */
export function createRoomAdvertisement(roomId: string, body: CreateAdvertisementInput) {
  return apiClient<ApiResponse<Advertisement>>(`/advertisements/rooms/${roomId}`, {
    method: "POST",
    body,
  });
}

/** `PATCH /advertisements/:advertisementId` */
export function updateAdvertisement(
  advertisementId: string,
  body: Partial<CreateAdvertisementInput>,
) {
  return apiClient<ApiResponse<Advertisement>>(`/advertisements/${advertisementId}`, {
    method: "PATCH",
    body,
  });
}

/** `PATCH /advertisements/:advertisementId/status` */
export function updateAdvertisementStatus(advertisementId: string, status: string) {
  return apiClient<ApiResponse<Advertisement>>(`/advertisements/${advertisementId}/status`, {
    method: "PATCH",
    body: { status },
  });
}
