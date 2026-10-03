import { MapPinnedIcon } from "lucide-react";
import Link from "next/link";
import { AddAreaDialog } from "@/components/modules/admin/add-area-dialog";
import { AddCityDialog } from "@/components/modules/admin/add-city-dialog";
import { AdminNav } from "@/components/modules/admin/admin-nav";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { StatCard } from "@/components/shared/stat-card";
import { TableSearch } from "@/components/shared/table-search";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { authedFetchJson } from "@/lib/auth-fetched";
import { formatDate } from "@/lib/format";
import type { Area, City } from "@/types";

export const metadata = {
  title: "Manage Cities & Areas",
};

/** Enough rows to populate the "add area" picker without paging through them. */
const CITY_OPTION_LIMIT = 200;

/** Areas nested under a city get truncated so one row cannot blow up the table. */
const AREA_PREVIEW_LIMIT = 4;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Drops empty values so the request never carries `?search=&cityId=`. */
function queryString(entries: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }

  return params.toString();
}

export default async function ManageAreasPage({
  searchParams,
}: PageProps<"/manage-areas">) {
  const params = await searchParams;

  // Tab, search term, city filter and paging are all read back out of the URL
  // so every view is shareable and survives a refresh.
  const tab = firstParam(params.tab) === "areas" ? "areas" : "cities";
  const search = firstParam(params.search)?.trim() ?? "";
  const cityId = firstParam(params.cityId) ?? "";
  const page = Math.max(1, Number(firstParam(params.page)) || 1);
  const limit = Math.max(1, Number(firstParam(params.limit)) || 10);

  const paging = { page, limit, search: search || undefined };

  const [citiesRes, areasRes, cityOptionsRes] = await Promise.all([
    authedFetchJson<City[]>(`/cities?${queryString(paging)}`),
    authedFetchJson<Area[]>(
      `/areas?${queryString({ ...paging, cityId: cityId || undefined })}`,
    ),
    authedFetchJson<City[]>(
      `/cities?${queryString({ limit: CITY_OPTION_LIMIT })}`,
    ),
  ]);

  const cities = citiesRes.data ?? [];
  const areas = areasRes.data ?? [];
  const cityOptions = cityOptionsRes.data ?? [];
  const hasCities = cityOptions.length > 0;
  const citiesWithoutAreas = cityOptions.filter(
    (city) => (city.areas?.length ?? 0) === 0,
  ).length;

  /** Keeps the search term and page size while switching the city filter. */
  const areaFilterHref = (nextCityId: string) => {
    const next = new URLSearchParams({ tab: "areas", limit: String(limit) });

    if (search) next.set("search", search);
    if (nextCityId) next.set("cityId", nextCityId);

    return `/manage-areas?${next.toString()}`;
  };

  const cityColumns: DataTableColumn<City>[] = [
    {
      key: "name",
      header: "City",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "areas",
      header: "Areas",
      cell: (row) => {
        const nested = row.areas ?? [];

        if (nested.length === 0) {
          return (
            <span className="text-sm text-muted-foreground">No areas yet</span>
          );
        }

        const preview = nested.slice(0, AREA_PREVIEW_LIMIT);
        const overflow = nested.length - preview.length;

        return (
          <span className="flex flex-wrap gap-1.5">
            {preview.map((area) => (
              <Badge key={area.id} variant="secondary">
                {area.name}
              </Badge>
            ))}
            {overflow > 0 ? (
              <Badge variant="outline">+{overflow} more</Badge>
            ) : null}
          </span>
        );
      },
    },
    {
      key: "areaCount",
      header: "Area count",
      cell: (row) => (row.areas ?? []).length,
    },
    {
      key: "createdAt",
      header: "Added on",
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  const areaColumns: DataTableColumn<Area>[] = [
    {
      key: "name",
      header: "Area",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "city",
      header: "City",
      // Clicking a city narrows the table to it, so the filter is reachable
      // from the data itself instead of needing a separate control.
      cell: (row) =>
        row.city ? (
          <Link
            href={areaFilterHref(row.city.id)}
            className="text-sm text-primary hover:underline"
          >
            {row.city.name}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      key: "properties",
      header: "Properties",
      cell: (row) => row._count?.properties ?? 0,
    },
    {
      key: "createdAt",
      header: "Added on",
      cell: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Manage Cities &amp; Areas
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
              Every city and area owners can attach a property to. Adding a city
              here makes it selectable the moment owners list a property.
            </p>
            <AdminNav activeHref="/manage-areas" className="mt-4 w-fit" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Cities"
                value={citiesRes.meta?.total ?? cities.length}
                description="Matching the current search"
              />
              <StatCard
                title="Areas"
                value={areasRes.meta?.total ?? areas.length}
                description="Matching the current filters"
              />
              <StatCard
                title="Cities without areas"
                value={citiesWithoutAreas}
                description="Owners cannot list a property there yet"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FilterTabs
                baseUrl="/manage-areas"
                active={tab}
                query={{ search: search || undefined, limit: String(limit) }}
                tabs={[
                  {
                    value: "cities",
                    label: "Cities",
                    count: citiesRes.meta?.total,
                  },
                  {
                    value: "areas",
                    label: "Areas",
                    count: areasRes.meta?.total,
                  },
                ]}
              />

              <TableSearch
                label={`Search ${tab}`}
                placeholder={tab === "areas" ? "Search areas" : "Search cities"}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {tab === "areas" ? (
                <>
                  <AddAreaDialog
                    cities={cityOptions}
                    defaultCityId={cityId || undefined}
                    disabled={!hasCities}
                  />
                  {cityId ? (
                    <Link
                      href={areaFilterHref("")}
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Clear city filter
                    </Link>
                  ) : null}
                </>
              ) : (
                <AddCityDialog />
              )}
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>
                  {tab === "areas" ? "All areas" : "All cities"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tab === "areas" && !hasCities ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MapPinnedIcon />
                      </EmptyMedia>
                      <EmptyTitle>No cities yet</EmptyTitle>
                      <EmptyDescription>
                        Areas belong to a city, so create one first — then areas
                        can be added under it.
                      </EmptyDescription>
                    </EmptyHeader>
                    <AddCityDialog />
                  </Empty>
                ) : tab === "cities" ? (
                  <DataTable
                    data={cities}
                    columns={cityColumns}
                    meta={citiesRes.meta}
                    baseUrl="/manage-areas"
                    rowKey={(row) => row.id}
                    itemLabel="city"
                    query={{ tab: "cities", ...params }}
                    emptyMessage={
                      search
                        ? `No city matches “${search}”.`
                        : "No cities have been added yet."
                    }
                  />
                ) : (
                  <DataTable
                    data={areas}
                    columns={areaColumns}
                    meta={areasRes.meta}
                    baseUrl="/manage-areas"
                    rowKey={(row) => row.id}
                    itemLabel="area"
                    query={{ tab: "areas", ...params }}
                    emptyMessage={
                      search || cityId
                        ? "No area matches these filters."
                        : "No areas have been added yet."
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
