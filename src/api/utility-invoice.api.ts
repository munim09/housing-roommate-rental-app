import apiClient from "@/lib/api-client";
import type { ApiResponse, BillStatus, Invoice } from "@/types";

/** Body of `POST /manager/utility-invoices` (see `req-res/api.txt`). */
export interface CreateUtilityInvoiceInput {
  stayId: string;
  amount: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  description?: string;
}

/** Body of `PATCH /manager/utility-invoices/:invoiceId` — at least one field. */
export interface UpdateUtilityInvoiceInput {
  amount?: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  description?: string;
  status?: BillStatus;
}

/**
 * `POST /manager/utility-invoices` — raises a utility bill against a stay.
 * The backend only accepts `CONFIRMED` stays, so callers gate on that first.
 */
export function createUtilityInvoice(body: CreateUtilityInvoiceInput) {
  return apiClient<ApiResponse<Invoice>>("/manager/utility-invoices", {
    method: "POST",
    body,
  });
}

/**
 * `PATCH /manager/utility-invoices/:invoiceId` — edits an existing bill.
 * The backend rejects the call once the bill is `PAID`, so the UI never shows
 * the action for one.
 */
export function updateUtilityInvoice(
  invoiceId: string,
  body: UpdateUtilityInvoiceInput,
) {
  return apiClient<ApiResponse<Invoice>>(
    `/manager/utility-invoices/${invoiceId}`,
    { method: "PATCH", body },
  );
}
