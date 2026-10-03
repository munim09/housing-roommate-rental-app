import { z } from "zod";
import { PROPERTY_TYPES } from "@/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Trims, and treats a whitespace-only box as "not filled in". */
const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be less than ${max} characters`)
    .optional()
    .or(z.literal(""));

/**
 * Coordinates are `Decimal(10,7)` columns, so they arrive as text from the
 * inputs. Validating here (instead of `z.coerce.number()`) keeps an empty box
 * empty rather than silently becoming `0`, which is a real coordinate.
 */
const optionalCoordinate = (label: string, limit: number) =>
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") return true;

      const parsed = Number(value);

      return Number.isFinite(parsed) && Math.abs(parsed) <= limit;
    }, `${label} must be a number between -${limit} and ${limit}`)
    .optional()
    .or(z.literal(""));

export const propertyTypeSchema = z.enum(PROPERTY_TYPES, {
  error: "Choose the kind of property",
});

/** Shape of the "add property" form and the `POST /owner/properties` payload. */
export const propertySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Property name is required")
    .max(150, "Name must be less than 150 characters"),
  type: propertyTypeSchema,
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(255, "Address must be less than 255 characters"),
  areaId: z
    .string()
    .trim()
    .min(1, "Select an area")
    .regex(UUID, "That area reference is not valid"),
  postalCode: optionalText("Postal code", 20),
  latitude: optionalCoordinate("Latitude", 90),
  longitude: optionalCoordinate("Longitude", 180),
  description: optionalText("Description", 1000),
});

export type PropertyValues = z.input<typeof propertySchema>;
export type PropertyInput = z.output<typeof propertySchema>;
