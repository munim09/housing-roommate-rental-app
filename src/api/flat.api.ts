import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  CreatedFlat,
  CreateFlatInput,
  OwnerFlatRecord,
  UpdatedFlat,
  UpdateFlatInput,
} from "@/types";

/**
 * `GET /owner/flats` — `OWNER` or `MANAGER`.
 *
 * Answers with the full owner list and no `meta`, and ignores `page`/`limit`, so
 * the UI filters client side and must not render server paging. Each row is a
 * `PropertyOwnership` record wrapping the flat.
 */
export function getOwnerFlats() {
  return apiClient<ApiResponse<OwnerFlatRecord[]>>("/owner/flats");
}

/** The backend caps an upload at 10 files per request. */
export const MAX_FLAT_IMAGES = 10;

/**
 * `POST /properties/:propertyId/flats` — owner only.
 *
 * This is the one write that is not plain JSON: the endpoint is
 * `multipart/form-data` and expects the flat fields as a **JSON string** in a
 * part literally named `data`, plus one `images` part per file. Passing the
 * fields as individual form fields fails with "Invalid JSON format in data
 * field", so the payload is serialised here rather than in the dialog.
 *
 * `flatNumber` is unique per property — a repeat answers 400 "Duplicate Key
 * Error", which the dialog surfaces as a form error.
 */
export function createFlat(
  propertyId: string,
  fields: CreateFlatInput,
  images: File[] = [],
) {
  const form = new FormData();

  form.append("data", JSON.stringify(fields));

  for (const image of images) {
    form.append("images", image);
  }

  return apiClient<ApiResponse<CreatedFlat>>(
    `/owner/properties/${propertyId}/flats`,
    { method: "POST", body: form },
  );
}

/**
 * `PATCH /flats/:flatId` — owner only. Unlike the create route this takes plain
 * JSON, and every field is optional, so the form submits every editable field.
 */
export function updateFlat(flatId: string, payload: UpdateFlatInput) {
  return apiClient<ApiResponse<UpdatedFlat>>(`/owner/flats/${flatId}`, {
    method: "PATCH",
    body: payload,
  });
}
