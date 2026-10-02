"use client";

import { ChevronLeftIcon, ChevronRightIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/modules/listings/listing-card";
import { ListingGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useApiErrorToast, useAvailableAdvertisements } from "@/hooks";
import { LISTING_TYPE_LABELS, type ListingSearchFilters } from "@/types";

interface ListingResultsProps {
  filters: ListingSearchFilters;
  areaLabel: string;
}

/** Pagination lives in the URL, so back/forward and shared links keep the page. */
function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav
      aria-label="Listings pagination"
      className="flex items-center justify-between gap-3 border-t pt-4"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
      >
        <ChevronLeftIcon aria-hidden="true" />
        Previous
      </Button>

      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
      >
        Next
        <ChevronRightIcon aria-hidden="true" />
      </Button>
    </nav>
  );
}

export function ListingResults({ filters, areaLabel }: ListingResultsProps) {
  const { listings, meta, isPending, isFetching, isError, error, refetch } =
    useAvailableAdvertisements(filters);

  useApiErrorToast(error, "Could not load listings");

  // Hand the current search back to the hero form so it comes up pre-filled.
  const adjustHref = (() => {
    const params = new URLSearchParams({
      areaId: filters.areaId,
      from: filters.from,
      to: filters.to,
    });
    if (areaLabel) params.set("area", areaLabel);
    if (filters.type !== "ANY") params.set("type", filters.type);

    return `/?${params.toString()}`;
  })();

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>We could not load these listings</EmptyTitle>
          <EmptyDescription>
            {error?.message ?? "The listings service did not respond."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => refetch()}>Try again</Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (isPending) return <ListingGridSkeleton />;

  if (listings.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>No matches for these dates</EmptyTitle>
          <EmptyDescription>
            Nothing is free in {areaLabel || "this area"} between your dates.
            Try widening the range or picking another type.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={adjustHref} />}
          >
            Adjust your search
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid gap-5">
      <p className="text-sm text-muted-foreground">
        Showing {listings.length} of {meta?.total ?? listings.length}{" "}
        {meta?.total === 1 ? "listing" : "listings"}
        {meta?.totalPages && meta.totalPages > 1
          ? ` · page ${meta.page} of ${meta.totalPages}`
          : ""}
        {filters.type !== "ANY"
          ? ` · ${LISTING_TYPE_LABELS[filters.type]}`
          : ""}
        {isFetching ? " · refreshing…" : ""}
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {meta ? (
        <Pagination page={meta.page} totalPages={meta.totalPages} />
      ) : null}
    </div>
  );
}
