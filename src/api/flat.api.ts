import apiClient, { apiUrl } from "@/lib/api-client";
import { type UploadProgress, uploadMultipart } from "@/lib/upload-multipart";
import type {
  AddedFlatImages,
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

/** Both photo routes hang off the flat, so the path is built in one place. */
function flatImagesPath(flatId: string) {
  return `/owner/flats/${flatId}/images`;
}

/**
 * `POST /owner/flats/:flatId/images` — owner only, `multipart/form-data`.
 *
 * Unlike the create route there is no `data` part here: every part is a file and
 * they all share the key `images`, so a flat that already exists can be given
 * more photos without resending its columns. The backend caps a request at
 * `MAX_FLAT_IMAGES` files.
 *
 * This goes through `XMLHttpRequest` rather than `ofetch` so the dialog can show
 * upload progress — `fetch` still has no upload progress event — while reading
 * the same envelope back and rejecting failures the same way.
 *
 * The response only carries the new Cloudinary URLs, so the refreshed list is
 * the source of truth for image ids afterwards.
 */
export function addFlatImages(
  flatId: string,
  images: File[],
  onProgress?: (progress: UploadProgress) => void,
) {
  const form = new FormData();

  for (const image of images) {
    form.append("images", image);
  }

  return uploadMultipart<AddedFlatImages>({
    url: apiUrl(flatImagesPath(flatId)),
    body: form,
    onProgress,
  });
}

/**
 * `DELETE /owner/flats/:flatId/images/:imageId` — owner only, no body.
 *
 * `imageId` is the `AccommodationImage` id, not the Cloudinary URL: the ids come
 * from `GET /owner/flats` on `flat.images`. Nothing useful comes back in `data`,
 * so only the envelope matters and the list is refetched to confirm the change.
 */
export function removeFlatImage(flatId: string, imageId: string) {
  return apiClient<ApiResponse<null>>(`${flatImagesPath(flatId)}/${imageId}`, {
    method: "DELETE",
  });
}

/**
 * `GET /owner/managers` — list active managers available to assign to flats.
 */
export async function getActiveManagers() {
  return apiClient<ApiResponse<import("@/types").FlatManager[]>>(
    "/owner/managers",
    {
      method: "GET",
    },
  );
}

/**
 * `POST /owner/flats/:flatId/assign-manager` — assign an active manager to the flat.
 */
export async function assignManager(flatId: string, managerId: string) {
  return apiClient<ApiResponse<import("@/types").FlatManagerAssignment>>(
    `/owner/flats/${flatId}/assign-manager`,
    {
      method: "POST",
      body: { managerId },
    },
  );
}

/**
 * `POST /owner/flats/:flatId/revoke-manager` — revoke the currently assigned manager.
 */
export async function revokeManager(flatId: string) {
  return apiClient<ApiResponse<import("@/types").FlatManagerAssignment>>(
    `/owner/flats/${flatId}/revoke-manager`,
    {
      method: "POST",
    },
  );
}
