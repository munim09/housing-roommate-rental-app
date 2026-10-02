import { useQuery } from "@tanstack/react-query";
import { getAreas } from "@/api";
import { toApiError } from "@/lib/api-client";
import type { Area, AreaQuery } from "@/types";

export const areaKeys = {
  all: ["areas"] as const,
  list: (params: AreaQuery) => ["areas", "list", params] as const,
};

async function fetchAreas(params: AreaQuery) {
  try {
    const response = await getAreas(params);
    // console.log("response", response);
    return response.data ?? [];
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Areas are only ever requested once the consumer types, so the box stays empty
 * on first paint and `enabled` gates the request on a non-empty search term.
 */
export function areasQuery(params: AreaQuery = {}) {
  return {
    queryKey: areaKeys.list(params),
    queryFn: () => fetchAreas(params),
    enabled: Boolean(params.search?.trim()),
    placeholderData: (previous: Area[] | undefined): Area[] | undefined =>
      previous,
  };
}

export function useAreas(params: AreaQuery = {}) {
  // console.log("searching .... ", params.search);
  return useQuery(areasQuery(params));
}
