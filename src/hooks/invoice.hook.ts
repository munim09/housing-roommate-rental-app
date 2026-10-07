"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateUtilityInvoiceInput,
  createUtilityInvoice,
  type UpdateUtilityInvoiceInput,
  updateUtilityInvoice,
} from "@/api/utility-invoice.api";
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

/**
 * `POST /manager/utility-invoices` — raises a utility bill on a stay the
 * backend has already confirmed. Every invoice list under `invoiceKeys` is
 * refetched so the drawer shows the new bill immediately.
 */
export function useCreateUtilityInvoice() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Invoice>, ApiError, CreateUtilityInvoiceInput>(
    {
      mutationFn: async (body) => {
        try {
          return await createUtilityInvoice(body);
        } catch (error) {
          throw toApiError(error);
        }
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      },
    },
  );
}

/**
 * `PATCH /manager/utility-invoices/:invoiceId` — edits an unpaid utility bill.
 * The backend locks `PAID` bills, which the UI mirrors by not offering the
 * action at all.
 */
export function useUpdateUtilityInvoice() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Invoice>,
    ApiError,
    { invoiceId: string; body: UpdateUtilityInvoiceInput }
  >({
    mutationFn: async ({ invoiceId, body }) => {
      try {
        return await updateUtilityInvoice(invoiceId, body);
      } catch (error) {
        throw toApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}
