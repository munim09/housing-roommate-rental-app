import { z } from "zod";
import { LISTING_TYPE_LABELS, LISTING_TYPES } from "@/types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dateField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(ISO_DATE, `${label} must be a valid date`);

export const listingTypeSchema = z.enum(LISTING_TYPES, {
  error: "Choose one of the listed types",
});

/** URL values come from the query string, so anything unknown falls back to Any. */
export function parseListingType(value: unknown) {
  const parsed = listingTypeSchema.safeParse(value);

  return parsed.success ? parsed.data : ("ANY" as const);
}

/**
 * Shape of the search form and the listings URL. `areaId`, `from` and `to` are
 * mandatory because the backend rejects `/available-advertisements` without
 * `areaId` and requires `to` to sit after `from`. `type` is the tenant-facing
 * filter — `ANY` is the absence of one, so it is left out of the URL.
 */
export const listingSearchSchema = z
  .object({
    areaId: z
      .string()
      .trim()
      .min(1, "Pick an area to search in")
      .regex(UUID, "That area reference is not valid"),
    from: dateField("Move-in date"),
    to: dateField("Move-out date"),
    type: listingTypeSchema,
  })
  .refine((value) => value.to >= value.from, {
    message: "Move-out must be on or after move-in",
    path: ["to"],
  });

export type ListingSearchValues = z.input<typeof listingSearchSchema>;
export type ListingSearchInput = z.output<typeof listingSearchSchema>;

export const LISTING_TYPE_OPTIONS = [
  { value: "ANY", label: LISTING_TYPE_LABELS.ANY },
  ...LISTING_TYPES.filter((value) => value !== "ANY").map((value) => ({
    value,
    label: LISTING_TYPE_LABELS[value],
  })),
] as const;
