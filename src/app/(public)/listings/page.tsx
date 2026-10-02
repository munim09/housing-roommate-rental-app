import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ListingSearchForm } from "@/components/form/listing-search-form";
import { ListingResults } from "@/components/modules/listings/listing-results";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
// Imported from the concrete module, not the `@/hooks` barrel: this file is a
// Server Component and only needs the query builders, not the client hooks.
import { advertisementQueries } from "@/hooks/advertisement.hook";
import type { ListingSearchFilters } from "@/types";
import { listingSearchSchema, parseListingType } from "@/validation";

export const metadata: Metadata = {
  title: "Available listings",
  description:
    "Every room and shared flat on Dwellio that is free for your dates, with real rent and verified landlords.",
};

const LIMIT = 12;

type SearchParams =
  PageProps<"/listings">["searchParams"] extends Promise<infer T> ? T : never;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(firstValue(value) ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseFilters(params: SearchParams): {
  filters: ListingSearchFilters;
  areaLabel: string;
} | null {
  const parsed = listingSearchSchema.safeParse({
    areaId: firstValue(params.areaId),
    from: firstValue(params.from),
    to: firstValue(params.to),
    type: parseListingType(firstValue(params.type)),
  });

  if (!parsed.success) return null;

  const { areaId, from, to, type } = parsed.data;

  return {
    filters: {
      areaId,
      from,
      to,
      type,
      page: toPositiveInt(params.page, 1),
      limit: LIMIT,
    },
    areaLabel: firstValue(params.area) ?? "",
  };
}

export default async function ListingsPage({
  searchParams,
}: PageProps<"/listings">) {
  const params = await searchParams;
  const parsed = parseFilters(params);

  const queryClient = new QueryClient();

  if (parsed) {
    // Only listings are warmed. The area box stays empty until someone types,
    // so `GET /areas` is never requested speculatively. "Single room" fans out
    // to two requests, so both keys are warmed here.
    await Promise.all(
      advertisementQueries(parsed.filters).map((query) =>
        queryClient.prefetchQuery(query),
      ),
    );
  }

  const defaultValues = parsed
    ? {
        areaId: parsed.filters.areaId,
        areaLabel: parsed.areaLabel,
        from: parsed.filters.from,
        to: parsed.filters.to,
        type: parsed.filters.type,
      }
    : undefined;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10 sm:px-6 lg:py-12">
            <div className="grid gap-2">
              <Badge variant="outline" className="w-fit gap-1.5 px-2.5 py-1">
                <SearchIcon aria-hidden="true" />
                {parsed ? "Available listings" : "No search applied"}
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                {parsed
                  ? `Rooms available in ${parsed.areaLabel || "your area"}`
                  : "Start with an area and your dates"}
              </h1>
            </div>

            <ListingSearchForm defaultValues={defaultValues} />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <HydrationBoundary state={dehydrate(queryClient)}>
            {parsed ? (
              <ListingResults
                filters={parsed.filters}
                areaLabel={parsed.areaLabel}
              />
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchIcon />
                  </EmptyMedia>
                  <EmptyTitle>Pick an area and a date range</EmptyTitle>
                  <EmptyDescription>
                    Listings are filtered by the search above. Choose an area
                    and the dates you can move in and out.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    nativeButton={false}
                    render={<Link href="/#search" />}
                  >
                    Start searching
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </HydrationBoundary>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
