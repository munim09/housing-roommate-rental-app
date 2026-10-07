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

/** The viewer's "today" as `YYYY-MM-DD`, used to reject past move-in dates. */
export function localToday(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export interface ApplicationWindow {
  /** `YYYY-MM-DD`; a move-in before this is in the past. */
  today: string;
  /** Earliest day the advertisement is free, `YYYY-MM-DD` ("" = no bound). */
  availableFrom: string;
  /** Last day the advertisement is free, `YYYY-MM-DD` ("" = no bound). */
  availableTo: string;
}

/**
 * The schema the apply form actually submits with: everything
 * `applicationSchema` checks, plus the calendar rules the listing implies —
 * move-in from today onwards, and both dates inside the availability window.
 * The backend enforces the same rules (`"Start date cannot be in the past"`),
 * but the form stops the bad value before it ever leaves the browser.
 */
export function createApplicationSchema({
  today,
  availableFrom,
  availableTo,
}: ApplicationWindow) {
  return applicationSchema.superRefine((value, ctx) => {
    const start = value.requestedStartDate;
    const end = value.requestedEndDate;

    // Ordering already reported by applicationSchema; avoid double errors.
    if (end < start) return;

    if (today && start < today) {
      ctx.addIssue({
        code: "custom",
        path: ["requestedStartDate"],
        message: `Move-in cannot be in the past — pick today (${today}) or a later date`,
      });
    }

    if (availableFrom && start < availableFrom) {
      ctx.addIssue({
        code: "custom",
        path: ["requestedStartDate"],
        message: `This listing is only available from ${availableFrom}`,
      });
    }

    if (availableTo && end > availableTo) {
      ctx.addIssue({
        code: "custom",
        path: ["requestedEndDate"],
        message: `This listing is only available until ${availableTo}`,
      });
    }
  });
}
