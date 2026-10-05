import type { ResourceStatus } from "./property.type";

/**
 * `POST /owner/flats/:flatId/rooms` echoes the new room with bare image URLs,
 * the same way the add-flat route answers.
 */
export interface CreatedRoom {
  id: string;
  flatId: string;
  roomNumber: string;
  name?: string | null;
  /** `Decimal(10,2)` column — the backend serialises it as a string. */
  areaSqFt?: string | null;
  description?: string | null;
  status: ResourceStatus;
  createdAt?: string;
  updatedAt?: string;
  images: string[];
}

/** `PATCH /owner/rooms/:roomId` answers with the row only — no relations. */
export interface UpdatedRoom {
  id: string;
  roomNumber: string;
  name?: string | null;
  areaSqFt?: string | null;
  description?: string | null;
  status: ResourceStatus;
}

/**
 * Fields of the `data` part in the add-room multipart body. Only `roomNumber` is
 * required; the rest of the room columns are nullable, and the same set is what
 * `PATCH /owner/rooms/:roomId` accepts, so both dialogs share this shape.
 */
export interface CreateRoomInput {
  roomNumber: string;
  name?: string;
  areaSqFt?: number;
  description?: string;
}

export type UpdateRoomInput = CreateRoomInput;
