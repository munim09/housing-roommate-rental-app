import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Shared by the create and edit utility-bill dialogs. The backend refuses a
 * period whose end sits before its start and refuses to touch a bill that is
 * already `PAID`, so the first rule is checked here and the second one is
 * enforced by hiding the edit action entirely.
 */
export const utilityBillSchema = z
  .object({
    amount: z
      .string()
      .trim()
      .min(1, "Amount is required")
      .refine((value) => Number(value) > 0, "Amount must be greater than 0"),
    billingPeriodStart: z
      .string()
      .regex(ISO_DATE, "Billing period start must be a valid date"),
    billingPeriodEnd: z
      .string()
      .regex(ISO_DATE, "Billing period end must be a valid date"),
    description: z.string().trim().max(500, "Keep it under 500 characters"),
    status: z.enum(["PENDING", "PAID", "CANCELLED"]),
  })
  .refine((value) => value.billingPeriodEnd >= value.billingPeriodStart, {
    message: "Billing period end must be on or after the start",
    path: ["billingPeriodEnd"],
  });

export type UtilityBillValues = z.input<typeof utilityBillSchema>;

export const EMPTY_UTILITY_BILL_VALUES: UtilityBillValues = {
  amount: "",
  billingPeriodStart: "",
  billingPeriodEnd: "",
  description: "",
  status: "PENDING",
};

/** The API takes ISO timestamps; the form uses `date` inputs. */
export function toPeriodStart(day: string) {
  return `${day}T00:00:00.000Z`;
}

export function toPeriodEnd(day: string) {
  return `${day}T23:59:59.000Z`;
}
