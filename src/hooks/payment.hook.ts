"use client";

import { useMutation } from "@tanstack/react-query";
import { createPayment } from "@/api";
import { toast } from "@/components/ui/toast";
import { toApiError } from "@/lib/api-client";

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
