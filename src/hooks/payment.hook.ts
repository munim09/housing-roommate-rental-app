"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkPayment, createPayment, getTenantPaymentHistory } from "@/api";
import { toast } from "@/components/ui/toast";
import { toApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type {
  ApiResponse,
  Meta,
  PaymentHistoryItem,
  PaymentRecord,
} from "@/types";

/** Query keys shared by the history hook and the check mutation. */
export const tenantPaymentKeys = {
  all: ["tenant-payments"] as const,
  page: (page: number, limit: number) =>
    ["tenant-payments", { page, limit }] as const,
};

/**
 * `GET /payments` — the signed-in tenant's payment history as a query row.
 * The check mutation invalidates `tenantPaymentKeys.all` so a fresh status is
 * reflected as soon as the gateway lookup settles.
 */
export function useTenantPaymentHistory(params?: {
  page?: number;
  limit?: number;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  return useQuery({
    queryKey: tenantPaymentKeys.page(page, limit),
    queryFn: async () => {
      const response = await getTenantPaymentHistory({ page, limit });
      return {
        items: Array.isArray(response.data) ? response.data : [],
        meta: response.meta,
      } as { items: PaymentHistoryItem[]; meta?: Meta };
    },
    placeholderData: (previous) => previous,
  });
}

/**
 * Opens an invoice on the SSLCommerz gateway.
 *
 * The backend answers with `gatewayUrl`, so the browser is sent there with a
 * full navigation — the gateway renders its own page and later bounces the
 * visitor back to `/payment/success/:transactionReference` or
 * `/payment/cancel`. Failures (an already paid invoice, an earlier rent
 * installment still outstanding, an expired booking) arrive as a toast.
 */
export function usePayInvoice() {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await createPayment(invoiceId);

      if (!response.success || !response.data?.gatewayUrl) {
        throw new Error(response.message || "Could not start the payment.");
      }

      return response.data;
    },
    onSuccess: (data) => {
      window.location.assign(data.gatewayUrl);
    },
    onError: (error) => {
      const apiError = toApiError(error);

      toast.add({
        title: "Payment could not be started",
        description: apiError.message,
        type: "error",
      });
    },
  });
}

/**
 * Re-checks a pending payment against the gateway. The backend answers 400
 * while the transaction is still in process, so that case surfaces as an
 * information toast instead of a scary error, and the history list refreshes.
 */
export function useCheckPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      transactionReference: string,
    ): Promise<PaymentRecord> => {
      let response: ApiResponse<PaymentRecord>;

      try {
        response = await checkPayment(transactionReference);
      } catch (error) {
        const apiError = toApiError(error);

        // "Transaction is in process" is the expected in-flight answer.
        throw { inProcess: true, message: apiError.message } as const;
      }

      if (!response.success || !response.data) {
        throw {
          inProcess: false,
          message: response.message || "Could not check the payment.",
        } as const;
      }

      return response.data;
    },
    onSuccess: (payment) => {
      const settled = payment.status === "SUCCESS";
      const kind = payment.type === "RENT" ? "rent" : "utility";

      toast.add({
        title: settled ? "Payment confirmed" : "Payment checked",
        description: settled
          ? `Your ${kind} payment of ${formatCurrency(Number(payment.amount))} is complete.`
          : `Gateway reports the payment as ${payment.status}.`,
        type: settled ? "success" : "info",
      });

      void queryClient.invalidateQueries({ queryKey: tenantPaymentKeys.all });
    },
    onError: (error: unknown) => {
      const details =
        typeof error === "object" && error !== null
          ? (error as { inProcess?: boolean; message?: string })
          : null;
      const inProcess = Boolean(details?.inProcess);
      const message = details?.message;

      toast.add({
        title: inProcess
          ? "Payment is still in process"
          : "Payment check failed",
        description: inProcess
          ? "The gateway has not settled this transaction yet. Try again in a moment."
          : message || "Please try again.",
        type: "info",
      });
    },
  });
}
