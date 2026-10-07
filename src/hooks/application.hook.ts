"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOwnerManagerApplications, updateApplicationStatus } from "@/api";
import { stayKeys } from "@/hooks/stay.hook";
import { toApiError } from "@/lib/api-client";
import type { ApiError, OwnerManagerApplication } from "@/types";

export const applicationKeys = {
  all: ["applications"] as const,
  ownerManager: ["applications", "owner-manager"] as const,
};

const PAGE_LIMIT = 50;

/** Safety net so a broken `meta` can never spin the pagination loop forever. */
const MAX_PAGES = 20;

/**
 * The endpoint is paginated and has no `advertisementId` filter, so the whole
 * owner/manager feed is pulled page by page and cached under one key. Every
 * advertisement dialog then filters the same cached list instead of hitting
 * the API again.
 */
async function fetchAllOwnerManagerApplications(): Promise<
  OwnerManagerApplication[]
> {
  const applications: OwnerManagerApplication[] = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const response = await getOwnerManagerApplications({
        page,
        limit: PAGE_LIMIT,
      });

      applications.push(...(response.data ?? []));

      const totalPages = Number(response.meta?.totalPages ?? 1);
      if (!Number.isFinite(totalPages) || page >= totalPages) break;
    }
  } catch (error) {
    throw toApiError(error);
  }

  return applications;
}

export function useOwnerManagerApplications(options?: { enabled?: boolean }) {
  return useQuery<OwnerManagerApplication[], ApiError>({
    queryKey: applicationKeys.ownerManager,
    queryFn: fetchAllOwnerManagerApplications,
    enabled: options?.enabled ?? true,
  });
}

/** Applications whose `advertisement.id` matches — the payload behind the modal. */
export function useAdvertisementApplications(
  advertisementId: string,
  enabled = true,
) {
  return useQuery<
    OwnerManagerApplication[],
    ApiError,
    OwnerManagerApplication[]
  >({
    queryKey: applicationKeys.ownerManager,
    queryFn: fetchAllOwnerManagerApplications,
    enabled: enabled && Boolean(advertisementId),
    select: (applications) =>
      applications.filter(
        (application) => application.advertisement?.id === advertisementId,
      ),
  });
}

/**
 * Approve / reject an application. Approval creates the stay record, so both
 * the application feed and the stay list are refetched together.
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: "APPROVED" | "REJECTED" | "WITHDRAWN";
    }) => {
      try {
        return await updateApplicationStatus(applicationId, status);
      } catch (error) {
        throw toApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      void queryClient.invalidateQueries({ queryKey: stayKeys.all });
    },
  });
}
