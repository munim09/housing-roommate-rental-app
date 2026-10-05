import type { CreateRoomInput } from "@/types";

export interface RoomFieldValues {
  roomNumber: string;
  name?: string;
  areaSqFt?: string;
  description?: string;
}

/**
 * Turns the room form's text values into the request payload.
 *
 * `areaSqFt` is a `Decimal?` column, so a blank box must be *omitted* rather than
 * sent as `0` — `0` is a real (wrong) value and `PATCH /owner/rooms/:roomId` would
 * overwrite the stored area with it. Omitting also protects the two columns the
 * list endpoint never returns: an untouched box simply keeps what is stored.
 */
export function toRoomPayload(values: RoomFieldValues): CreateRoomInput {
  const payload: CreateRoomInput = { roomNumber: values.roomNumber.trim() };
  const areaSqFt = values.areaSqFt?.trim();

  if (values.name?.trim()) {
    payload.name = values.name.trim();
  }

  if (areaSqFt) {
    payload.areaSqFt = Number(areaSqFt);
  }

  if (values.description?.trim()) {
    payload.description = values.description.trim();
  }

  return payload;
}
