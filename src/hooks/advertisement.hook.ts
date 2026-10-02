import { type UseQueryOptions, useQueries } from "@tanstack/react-query";
import { getAvailableAdvertisements } from "@/api";
import { toApiError } from "@/lib/api-client";
import type {
  ApiError,
  ApiResponse,
  AvailableAdvertisement,
  AvailableAdvertisementQuery,
  ListingSearchFilters,
  Meta,
} from "@/types";
import { LISTING_TYPE_RENTAL_TYPES } from "@/types";

export type AvailableAdvertisementsData = ApiResponse<AvailableAdvertisement[]>;

export const advertisementKeys = {
  all: ["advertisements"] as const,
  available: (params: AvailableAdvertisementQuery) =>
    ["advertisements", "available", params] as const,
};

async function fetchAvailableAdvertisements(
  params: AvailableAdvertisementQuery,
) {
  try {
    return await getAvailableAdvertisements(params);
  } catch (error) {
    throw toApiError(error);
  }
}

function availableAdvertisementsQuery(
  params: AvailableAdvertisementQuery,
): UseQueryOptions<AvailableAdvertisementsData, ApiError> {
  return {
    queryKey: advertisementKeys.available(params),
    queryFn: () => fetchAvailableAdvertisements(params),
    // `/available-advertisements` needs areaId + from + to before it can run.
    enabled: Boolean(params.areaId && params.from && params.to),
    placeholderData: (
      previous: AvailableAdvertisementsData | undefined,
    ): AvailableAdvertisementsData | undefined => previous,
  };
}

/**
 * One request per backend `RentalType` behind the chosen type. "Single room"
 * resolves to two calls — `PRIMARY_ROOM` and `SECONDARY_ROOM` — while "Any"
 * sends no `rentalType` at all and stays a single call.
 *
 * The server prefetch and the client hook both build the list from here, so the
 * query keys always line up.
 */
export function advertisementQueries(filters: ListingSearchFilters) {
  return LISTING_TYPE_RENTAL_TYPES[filters.type].map((rentalType) =>
    availableAdvertisementsQuery({
      areaId: filters.areaId,
      from: filters.from,
      to: filters.to,
      page: filters.page,
      limit: filters.limit,
      rentalType,
    }),
  );
}

/**
 * Flattens the fan-out into one list. Totals are summed and the widest page
 * count wins, so pagination still lines up with a merged "Single room" search.
 */
export function mergeAdvertisementPages(
  responses: Array<AvailableAdvertisementsData | undefined>,
): { listings: AvailableAdvertisement[]; meta?: Meta } {
  const seen = new Set<string>();
  const listings: AvailableAdvertisement[] = [];

  for (const response of responses) {
    for (const listing of response?.data ?? []) {
      if (seen.has(listing.id)) continue;
      seen.add(listing.id);
      listings.push(listing);
    }
  }

  const pages = responses
    .map((response) => response?.meta)
    .filter((meta): meta is Meta => Boolean(meta));
  const first = pages[0];

  if (!first) return { listings };

  return {
    listings,
    meta: {
      page: first.page,
      limit: first.limit,
      total: pages.reduce((total, meta) => total + meta.total, 0),
      totalPages: pages.reduce(
        (max, meta) => Math.max(max, meta.totalPages),
        0,
      ),
    },
  };
}

export function useAvailableAdvertisements(filters: ListingSearchFilters) {
  const results = useQueries({ queries: advertisementQueries(filters) });

  const { listings, meta } = mergeAdvertisementPages(
    results.map((result) => result.data),
  );
  const failed = results.find((result) => result.isError);

  return {
    listings,
    meta,
    isPending: results.some((result) => result.isPending),
    isFetching: results.some((result) => result.isFetching),
    isError: Boolean(failed),
    error: failed?.error ?? null,
    refetch: () => {
      for (const result of results) void result.refetch();
    },
  };
}
