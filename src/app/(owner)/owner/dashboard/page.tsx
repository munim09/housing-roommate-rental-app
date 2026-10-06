import { Building2Icon } from "lucide-react";
import { AddPropertyDialog } from "@/components/modules/owner/add-property-dialog";
import { OwnerNav } from "@/components/modules/owner/owner-nav";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { formatCurrency, formatDate } from "@/lib/format";
import {
  type City,
  type OwnerDashboardStats,
  type OwnerProperty,
  PROPERTY_TYPE_LABELS,
  sumPropertyCapacity,
  toPropertyAreaOptions,
} from "@/types";

export const metadata = {
  title: "Owner Dashboard",
};

/** Enough rows to populate the "add property" area picker without paging. */
const CITY_OPTION_LIMIT = 200;

/** Flats listed per property cell before it collapses into a counter. */
const FLAT_PREVIEW_LIMIT = 3;

export default async function OwnerDashboardPage() {
  // `Promise.all` keeps the dashboard to a single round trip: the owner sees
  // stats, their properties and the area picker at the same time.
  const [statsRes, propertiesRes, cityOptionsRes] = await Promise.all([
    authedFetchJson<OwnerDashboardStats>("/owner/dashboard"),
    authedFetchJson<OwnerProperty[]>("/owner/properties"),
    authedFetchJson<City[]>(`/cities?limit=${CITY_OPTION_LIMIT}`),
  ]);

  const stats = (statsRes as any)?.data ?? statsRes;
  const properties = (propertiesRes as any)?.data ?? propertiesRes ?? [];
  const areaOptions = toPropertyAreaOptions(
    ((cityOptionsRes as any)?.data ?? cityOptionsRes ?? []) as any,
  );
  const totals = sumPropertyCapacity(properties);
  const hasAreas = areaOptions.length > 0;

  const propertyColumns: DataTableColumn<OwnerProperty>[] = [
    {
      key: "name",
      header: "Property",
      cell: (row) => (
        <span className="grid gap-1">
          <span className="font-medium">{row.name}</span>
          <span className="text-xs text-muted-foreground">
            {PROPERTY_TYPE_LABELS[row.type]}
          </span>
        </span>
      ),
    },
    {
      key: "area",
      header: "Area",
      cell: (row) => row.area?.name ?? "—",
    },
    {
      key: "address",
      header: "Address",
      cell: (row) => (
        <span className="text-muted-foreground">{row.address}</span>
      ),
    },
    {
      key: "flats",
      header: "Flats",
      cell: (row) => {
        const flats = row.flats ?? [];

        if (flats.length === 0) {
          return (
            <span className="text-sm text-muted-foreground">No flats yet</span>
          );
        }

        const preview = flats.slice(0, FLAT_PREVIEW_LIMIT);
        const overflow = flats.length - preview.length;

        return (
          <span className="flex flex-wrap gap-1.5">
            {preview.map((flat) => (
              <Badge key={flat.id} variant="secondary">
                {flat.flatNumber}
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
      key: "rooms",
      header: "Rooms",
      cell: (row) =>
        (row.flats ?? []).reduce(
          (total, flat) => total + (flat.rooms?.length ?? 0),
          0,
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
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
              Owner Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
              Everything you own, and what it has earned so far. Add a property
              first, then break it into flats.
            </p>
            <OwnerNav activeHref="/owner/dashboard" className="mt-4 w-fit" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Properties"
                value={stats?.properties ?? totals.properties}
                description="Buildings you own"
              />
              <StatCard
                title="Owned flats"
                value={stats?.ownedFlats ?? totals.flats}
                description="Rentable units across them"
              />
              <StatCard
                title="Confirmed stays"
                value={stats?.confirmedStays ?? 0}
                description={`${stats?.activeStays ?? 0} active right now`}
              />
              <StatCard
                title="Total collection"
                value={formatCurrency(stats?.totalCollection)}
                description={`${formatCurrency(
                  stats?.rentCollectionThisMonth,
                )} rent this month`}
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Your properties
                </h2>
                <p className="text-sm text-muted-foreground">
                  {properties.length === 0
                    ? "No properties yet"
                    : `${properties.length} propert${
                        properties.length === 1 ? "y" : "ies"
                      } · ${totals.flats} flat${totals.flats === 1 ? "" : "s"} · ${
                        totals.rooms
                      } room${totals.rooms === 1 ? "" : "s"}`}
                </p>
              </div>

              <AddPropertyDialog areas={areaOptions} disabled={!hasAreas} />
            </div>

            {!hasAreas ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Properties need an area before they can be listed. Ask an admin
                to add cities and areas first.
              </p>
            ) : null}

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>All properties</CardTitle>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Building2Icon />
                      </EmptyMedia>
                      <EmptyTitle>No properties yet</EmptyTitle>
                      <EmptyDescription>
                        {hasAreas
                          ? "Add your first property to start listing its flats to tenants."
                          : "An admin has to add cities and areas before a property can be placed."}
                      </EmptyDescription>
                    </EmptyHeader>
                    <AddPropertyDialog
                      areas={areaOptions}
                      disabled={!hasAreas}
                    />
                  </Empty>
                ) : (
                  <DataTable
                    data={properties}
                    columns={propertyColumns}
                    baseUrl="/owner/dashboard"
                    rowKey={(row) => row.id}
                    itemLabel="property"
                    emptyMessage="You do not own any properties yet."
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
