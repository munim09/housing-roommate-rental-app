import { z } from "zod";
import { MAX_FLAT_IMAGES } from "@/api/flat.api";
import { type ImageUploadRules, validateImageFiles } from "./image.validation";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Accepts "2", "2.5" and "" but rejects "two", "1e" and out-of-range values. */
const optionalNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") return true;

      const parsed = Number(value);

      return Number.isFinite(parsed) && parsed >= 0 && parsed <= max;
    }, `${label} must be a number between 0 and ${max}`)
    .optional()
    .or(z.literal(""));

/** `floorNumber` and friends are `Int?` columns, so they cannot be fractional. */
const optionalInteger = (label: string, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") return true;

      const parsed = Number(value);

      return Number.isInteger(parsed) && parsed >= 0 && parsed <= max;
    }, `${label} must be a whole number between 0 and ${max}`)
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
 * The `data` part of `POST /properties/:propertyId/flats`, and also the shape
 * `PATCH /flats/:flatId` accepts — the update route carries the same columns
 * minus `propertyId`, because a flat cannot be moved between properties.
 *
 * `flatNumber` is the only required field: the Prisma schema makes the rest
 * nullable, so an owner can register a bare flat and fill the details in later
 * through `PATCH`. Duplicates inside one property are rejected by the backend
 * with a 400, which the dialog shows against this field.
 */
export const flatSchema = z.object({
  propertyId: z
    .string()
    .trim()
    .min(1, "Select a property")
    .regex(UUID, "That property reference is not valid"),
  flatNumber: z
    .string()
    .trim()
    .min(1, "Flat number is required")
    .max(50, "Flat number must be less than 50 characters"),
  floorNumber: optionalInteger("Floor number", 500),
  bedrooms: optionalInteger("Bedrooms", 100),
  bathrooms: optionalInteger("Bathrooms", 100),
  areaSqFt: optionalNumber("Area", 1_000_000),
  description: descriptionField,
});

export type FlatValues = z.input<typeof flatSchema>;

/**
 * Client-side mirror of the upload rules for a flat's photos, so a bad file never
 * leaves the form. Room photos go through the same shared rules with their own
 * cap — see `room.validation`.
 */
export function validateFlatImages(files: File[]) {
  return validateImageFiles(files, MAX_FLAT_IMAGES);
}

/** The flat photo picker's rules, ready to pass down. */
export const FLAT_IMAGE_RULES: ImageUploadRules = {
  max: MAX_FLAT_IMAGES,
  validate: validateFlatImages,
};
