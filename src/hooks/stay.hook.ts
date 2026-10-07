"use client";

import { useQuery } from "@tanstack/react-query";
import { getStays } from "@/api";
import { toApiError } from "@/lib/api-client";
import type { ApiError, StayRecord } from "@/types";

export const stayKeys = {
  all: ["stays"] as const,
};

/**
 * The stay list backs the "no stay yet" / stay record sections on the
 * application board. It is not paginated, so a single query feeds every row
 * and is joined by `application.stay.id`.
 */
export function useStays() {
  return useQuery<StayRecord[], ApiError>({
    queryKey: stayKeys.all,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const response = await getStays();
        return response.data ?? [];
      } catch (error) {
        throw toApiError(error);
      }
    },
  });
}
