"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient, { toApiError } from "@/lib/api-client";
import type { ApiError, ApiResponse, Invoice } from "@/types";

export const invoiceKeys = {
  all: ["invoices"] as const,
  byStay: (applicationId: string) =>
    ["invoices", "by-stay", applicationId] as const,
};

/**
 * `GET /tenant/invoices/by-stay?applicationId=…` — read-only invoice list for
 * the application detail drawer. The backend answers 404 when the application
 * has no stay, so the query only runs for applications that own one and never
 * retries on failure.
 */
export function useInvoicesByStay(applicationId: string, enabled = true) {
  return useQuery<Invoice[], ApiError>({
    queryKey: invoiceKeys.byStay(applicationId),
    enabled: enabled && Boolean(applicationId),
    retry: false,
    queryFn: async () => {
      try {
        const response = await apiClient<ApiResponse<Invoice[]>>(
          "/tenant/invoices/by-stay",
          { params: { applicationId } },
        );
        return response.data ?? [];
      } catch (error) {
        throw toApiError(error);
      }
    },
  });
}
