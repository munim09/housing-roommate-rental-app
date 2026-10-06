import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Fields shared by the create (flat/room) and update advertisement forms. The
 * backend answers 400 when `availableTo` sits before `availableFrom`, so that
 * is checked here first. `monthlyRent` stays text in the form so an empty box
 * stays empty; it is converted before the request is built.
 */
export const advertisementFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional(),
    monthlyRent: z
      .string()
      .trim()
      .min(1, "Monthly rent is required")
      .refine(
        (value) => Number(value) > 0,
        "Monthly rent must be greater than 0",
      ),
    availableFrom: z
      .string()
      .regex(ISO_DATE, "Available from must be a valid date"),
    availableTo: z
      .string()
      .regex(ISO_DATE, "Available to must be a valid date"),
  })
  .refine((value) => value.availableTo >= value.availableFrom, {
    message: "Available to must be on or after available from",
    path: ["availableTo"],
  });

export type AdvertisementFormValues = z.input<typeof advertisementFormSchema>;

export const EMPTY_ADVERTISEMENT_VALUES: AdvertisementFormValues = {
  title: "",
  description: "",
  monthlyRent: "",
  availableFrom: "",
  availableTo: "",
};

/** Backend dates arrive ISO (`2026-09-24T00:00:00.000Z`); `date` inputs want `YYYY-MM-DD`. */
export function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

/** The create/update payload type the advertisement API endpoints consume. */
export type AdvertisementPayload = z.input<typeof advertisementFormSchema>;
