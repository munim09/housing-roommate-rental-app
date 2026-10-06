import apiClient, { toApiError } from "@/lib/api-client";
import { authedFetchJson } from "@/lib/auth-fetched";
import type { ApiResponse, PaymentInitiation, PaymentRecord } from "@/types";

/**
 * `POST /payments/create/:invoiceId` — TENANT only, so it rides the httpOnly
 * session cookie through `authedFetch`. The response carries the SSLCommerz
 * gateway URL the browser must be sent to.
 */
export function createPayment(invoiceId: string) {
  return authedFetchJson<ApiResponse<PaymentInitiation>>(
    `/payments/create/${invoiceId}`,
    { method: "POST" },
  );
}

/**
 * `GET /payments/check/:transactionReference` — a public gateway lookup, so it
 * deliberately skips `authedFetch`: the success/cancel landing pages must work
 * for a visitor with no session at all.
 */
export function checkPayment(transactionReference: string) {
  return apiClient<ApiResponse<PaymentRecord>>(
    `/payments/check/${encodeURIComponent(transactionReference)}`,
  );
}

export interface PaymentStatusResult {
  payment: PaymentRecord | null;
  error: string | null;
}

/**
 * Gateway lookup for the public success/cancel landing pages. It never throws:
 * those pages must be able to render "we could not reach the gateway" instead
 * of crashing, because they are the last thing a visitor sees after paying.
 */
export async function loadPaymentStatus(
  transactionReference: string,
): Promise<PaymentStatusResult> {
  try {
    const response = await checkPayment(transactionReference);

    if (!response.success || !response.data) {
      return {
        payment: null,
        error:
          response.message ||
          "No payment record exists for this transaction reference.",
      };
    }

    return { payment: response.data, error: null };
  } catch (error) {
    return { payment: null, error: toApiError(error).message };
  }
}
