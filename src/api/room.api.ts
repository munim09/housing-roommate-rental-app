import apiClient, { apiUrl } from "@/lib/api-client";
import { type UploadProgress, uploadMultipart } from "@/lib/upload-multipart";
import type {
  ApiResponse,
  CreatedRoom,
  CreateRoomInput,
  UpdatedRoom,
  UpdateRoomInput,
} from "@/types";

/** The backend caps an upload at 10 files per request, rooms included. */
export const MAX_ROOM_IMAGES = 10;

/**
 * `POST /owner/flats/:flatId/rooms` — owner only.
 *
 * Like add-flat, this is `multipart/form-data` rather than JSON: the room
 * columns travel as a JSON string in a part named `data`, and every photo is a
 * separate `images` part. The columns are optional apart from `roomNumber`, so an
 * owner can register a bare room and fill the rest in later.
 *
 * Sent through `XMLHttpRequest` so the dialog can show upload progress; the
 * envelope and the `ApiError` rejections are identical to the ofetch calls.
 */
export function createRoom(
  flatId: string,
  fields: CreateRoomInput,
  images: File[] = [],
  onProgress?: (progress: UploadProgress) => void,
) {
  const form = new FormData();

  form.append("data", JSON.stringify(fields));

  for (const image of images) {
    form.append("images", image);
  }

  return uploadMultipart<CreatedRoom>({
    url: apiUrl(`/owner/flats/${flatId}/rooms`),
    body: form,
    onProgress,
  });
}

/**
 * `PATCH /owner/rooms/:roomId` — owner only. Plain JSON, no `data` wrapper, and
 * the response carries the room row without its images.
 *
 * Note the collection is addressed by room id here, not by
 * `/owner/flats/:flatId/rooms/:roomId`.
 */
export function updateRoom(roomId: string, payload: UpdateRoomInput) {
  return apiClient<ApiResponse<UpdatedRoom>>(`/owner/rooms/${roomId}`, {
    method: "PATCH",
    body: payload,
  });
}
