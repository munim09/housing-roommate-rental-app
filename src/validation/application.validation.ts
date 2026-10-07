import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const dateField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(ISO_DATE, `${label} must be a valid date`);

/**
 * `POST /tenant/applications` body. The dates are `YYYY-MM-DD` strings
 * straight from the search URL (or the listing's availability window), and
 * the note is optional context for the owner reviewing it.
 */
export const applicationSchema = z
  .object({
    requestedStartDate: dateField("Move-in date"),
    requestedEndDate: dateField("Move-out date"),
    note: z.string().trim().max(500, "Keep the note under 500 characters"),
  })
  .refine((value) => value.requestedEndDate >= value.requestedStartDate, {
    message: "Move-out must be on or after move-in",
    path: ["requestedEndDate"],
  });

export type ApplicationValues = z.input<typeof applicationSchema>;
export type ApplicationInput = z.output<typeof applicationSchema>;
