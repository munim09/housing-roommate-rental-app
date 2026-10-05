"use client";

import { useForm } from "@tanstack/react-form";
import { type RoomValues, roomSchema } from "@/validation";

export const EMPTY_ROOM_VALUES: RoomValues = {
  roomNumber: "",
  name: "",
  areaSqFt: "",
  description: "",
};

/**
 * One form, one schema, used by both the add and the update room dialog.
 *
 * `PATCH /owner/rooms/:roomId` takes the same columns as the add payload, so the
 * update dialog starts from the room it was given and the two cannot drift into
 * subtly different validators.
 *
 * `areaSqFt` stays text so an empty box stays empty, and `toRoomPayload` turns it
 * into a number — or omits it entirely, which is what keeps an update from
 * blanking a column the list endpoint never sent.
 */
export function useRoomForm(options: {
  defaultValues: RoomValues;
  onSubmit: (values: RoomValues) => void;
}) {
  return useForm({
    defaultValues: options.defaultValues,
    validators: { onSubmit: roomSchema },
    onSubmit: async ({ value }) => {
      options.onSubmit(value);
    },
  });
}

export type RoomFormApi = ReturnType<typeof useRoomForm>;
