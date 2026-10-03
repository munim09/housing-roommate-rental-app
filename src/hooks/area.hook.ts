import { useQuery } from "@tanstack/react-query";
import { getAreas, getCities } from "@/api";
import { toApiError } from "@/lib/api-client";
import type { Area, AreaQuery, City, CityQuery } from "@/types";

export const areaKeys = {
  all: ["areas"] as const,
  list: (params: AreaQuery) => ["areas", "list", params] as const,
};

export const cityKeys = {
  all: ["cities"] as const,
  list: (params: CityQuery) => ["cities", "list", params] as const,
};

async function fetchAreas(params: AreaQuery) {
  try {
    const response = await getAreas(params);
    return response.data ?? [];
  } catch (error) {
    throw toApiError(error);
  }
}

async function fetchCities(params: CityQuery) {
  try {
    const response = await getCities(params);
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
  return useQuery(areasQuery(params));
}

/**
 * Unfiltered variant used where every city is needed at once — e.g. populating
 * the "add area" city picker — so the request is never gated on a search term.
 */
export function useCities(params: CityQuery = {}) {
  return useQuery({
    queryKey: cityKeys.list(params),
    queryFn: () => fetchCities(params),
    placeholderData: (previous: City[] | undefined): City[] | undefined =>
      previous,
  });
}
