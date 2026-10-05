import { z } from "zod";
import { MAX_ROOM_IMAGES } from "@/api/room.api";
import { type ImageUploadRules, validateImageFiles } from "./image.validation";

/** `areaSqFt` is a `Decimal`, so a fraction is allowed here. */
const optionalArea = z
  .string()
  .trim()
  .refine((value) => {
    if (value === "") return true;

    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000_000;
  }, "Area must be a number between 0 and 1000000")
  .optional()
  .or(z.literal(""));

/** Textarea length matches the `description` column. */
const descriptionField = z
  .string()
  .trim()
  .max(1000, "Description must be less than 1000 characters")
  .optional()
  .or(z.literal(""));

/**
 * The `data` part of `POST /owner/flats/:flatId/rooms`, and also the body
 * `PATCH /owner/rooms/:roomId` accepts — the update route takes the same columns.
 *
 * `roomNumber` is the only required field: the room columns are nullable, so a
 * room can be registered bare and detailed later. A duplicate room number inside
 * one flat is rejected by the backend with a 400, which the dialog shows against
 * that field.
 */
export const roomSchema = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, "Room number is required")
    .max(50, "Room number must be less than 50 characters"),
  name: z
    .string()
    .trim()
    .max(100, "Name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  areaSqFt: optionalArea,
  description: descriptionField,
});

export type RoomValues = z.input<typeof roomSchema>;

/** Client-side mirror of the room photo upload rules. */
export function validateRoomImages(files: File[]) {
  return validateImageFiles(files, MAX_ROOM_IMAGES);
}

/** The room photo picker's rules, ready to pass down. */
export const ROOM_IMAGE_RULES: ImageUploadRules = {
  max: MAX_ROOM_IMAGES,
  validate: validateRoomImages,
};
