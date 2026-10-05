import { BuildingIcon, DoorOpenIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddFlatDialog } from "@/components/modules/owner/add-flat-dialog";
import { FlatRoomsSheet } from "@/components/modules/owner/flat-rooms-sheet";
import { FlatRowActions } from "@/components/modules/owner/flat-row-actions";
import { OwnerNav } from "@/components/modules/owner/owner-nav";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { formatAreaSqFt } from "@/lib/format";
import {
  type OwnerFlatRecord,
  type OwnerProperty,
  primaryFlatImage,
} from "@/types";

export const metadata = {
  title: "Manage Flats",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Rooms listed inside the sheet before it would get unwieldy. */
const ROOM_PREVIEW_LIMIT = 3;

export default async function ManageFlatsPage({
  searchParams,
}: PageProps<"/owner/manage-flats">) {
  const params = await searchParams;

  // The search term, property filter and the open drawer are all read back out
  // of the URL, so every view is shareable and survives a refresh.
  const search = firstParam(params.search)?.trim() ?? "";
  const propertyFilter = firstParam(params.propertyId) ?? "";
  const selectedFlatId = firstParam(params.flatId) ?? "";

  // One round trip: the flat list drives the table and the room drawer, and the
  // property list is only needed to populate the "add flat" picker.
  const [flatsRes, propertiesRes] = await Promise.all([
    authedFetchJson<OwnerFlatRecord[]>("/owner/flats"),
    authedFetchJson<OwnerProperty[]>("/owner/properties"),
  ]);

  const records = ((flatsRes as any)?.data ?? flatsRes ?? []) as any[];
  const properties = ((propertiesRes as any)?.data ?? propertiesRes ?? []) as any[];

  const term = search.toLowerCase();
  const visible = records.filter((record) => {
    if (propertyFilter && record.flat.property?.id !== propertyFilter) {
      return false;
    }

    if (!term) return true;

    return [
      record.flat.flatNumber,
      record.flat.property?.name,
      record.flat.property?.area?.name,
      record.flat.description,
    ].some((value) => value?.toLowerCase().includes(term));
  });

  const selected = records.find(
    (record) =>
      record.flatId === selectedFlatId || record.flat.id === selectedFlatId,
  );

  const roomTotal = records.reduce(
    (total, record) => total + (record.flat.rooms?.length ?? 0),
    0,
  );
  const flatsWithoutRooms = records.filter(
    (record) => (record.flat.rooms?.length ?? 0) === 0,
  ).length;
  const propertyCount = new Set(
    records.map((record) => record.flat.property?.id).filter(Boolean),
  ).size;
  const canAddFlat = properties.some(
    (property) =>
      property.type === "MULTI_FLAT" || property.type === "SINGLE_FLAT",
  );

  /** Keeps the search term while switching the property filter. */
  const propertyFilterHref = (nextPropertyId: string) => {
    const next = new URLSearchParams();

    if (search) next.set("search", search);
    if (nextPropertyId) next.set("propertyId", nextPropertyId);

    const query = next.toString();

    return query ? `/owner/manage-flats?${query}` : "/owner/manage-flats";
  };

  /** Opens the room drawer for a flat while preserving the active filters. */
  const flatDetailHref = (flatId: string) => {
    const next = new URLSearchParams();

    if (search) next.set("search", search);
    if (propertyFilter) next.set("propertyId", propertyFilter);
    next.set("flatId", flatId);

    return `/owner/manage-flats?${next.toString()}`;
  };

  const columns: DataTableColumn<OwnerFlatRecord>[] = [
    {
      key: "flatNumber",
      header: "Flat",
      cell: (record) => {
        const image = primaryFlatImage(record.flat.images);

        return (
          <div className="flex items-center gap-3">
            <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-md">
              {image ? (
                <Image
                  src={image.imageUrl}
                  alt={`Flat ${record.flat.flatNumber}`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : null}
            </div>
            {/* Clicking the flat number peeks at its rooms in the drawer; the bed
                button in the row actions opens the flat's own page. */}
            <Link
              href={flatDetailHref(record.flatId)}
              scroll={false}
              className="font-medium underline-offset-4 hover:underline"
            >
              {record.flat.flatNumber}
            </Link>
          </div>
        );
      },
    },
    {
      key: "property",
      header: "Property",
      cell: (record) => (
        <span className="grid gap-1">
          <span>{record.flat.property?.name ?? "—"}</span>
          <span className="text-xs text-muted-foreground">
            {record.flat.property?.area?.name ?? "No area"}
          </span>
        </span>
      ),
    },
    {
      key: "floorNumber",
      header: "Floor",
      cell: (record) => record.flat.floorNumber ?? "—",
    },
    {
      key: "bedrooms",
      header: "Beds",
      cell: (record) => record.flat.bedrooms ?? "—",
    },
    {
      key: "bathrooms",
      header: "Baths",
      cell: (record) => record.flat.bathrooms ?? "—",
    },
    {
      key: "areaSqFt",
      header: "Area",
      cell: (record) => (
        <span className="text-muted-foreground">
          {formatAreaSqFt(record.flat.areaSqFt)}
        </span>
      ),
    },
    {
      key: "rooms",
      header: "Rooms",
      cell: (record) => {
        const rooms = record.flat.rooms ?? [];

        if (rooms.length === 0) {
          return (
            <span className="text-muted-foreground text-sm">No rooms yet</span>
          );
        }

        const preview = rooms.slice(0, ROOM_PREVIEW_LIMIT);
        const overflow = rooms.length - preview.length;

        // Rooms are managed on the flat's own page, so the preview leads there.
        return (
          <Link
            href={`/owner/flats/${record.flat.id}`}
            className="flex w-fit flex-wrap gap-1.5 no-underline"
          >
            {preview.map((room) => (
              <Badge key={room.id} variant="secondary">
                {room.roomNumber}
              </Badge>
            ))}
            {overflow > 0 ? (
              <Badge variant="outline">+{overflow} more</Badge>
            ) : null}
          </Link>
        );
      },
    },
    {
      key: "manager",
      header: "Manager",
      cell: (record) => {
        const assignments = record.flat.managerAssignments ?? [];
        const active = assignments.find(
          (assignment) => assignment.status === "ACTIVE" || !assignment.endedAt,
        );
        return (
          <span className="text-sm">{active?.manager?.name ?? "None"}</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (record) => <StatusBadge status={record.flat.status} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (record) => <FlatRowActions flat={record.flat} />,
      className: "w-px",
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Manage Flats
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
              Every flat you own. Open one to see its rooms, or add another one
              to a property.
            </p>
            <OwnerNav activeHref="/owner/manage-flats" className="mt-4 w-fit" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Flats"
                value={records.length}
                description={`Across ${propertyCount} propert${
                  propertyCount === 1 ? "y" : "ies"
                }`}
              />
              <StatCard
                title="Rooms"
                value={roomTotal}
                description="What tenants actually book"
              />
              <StatCard
                title="Awaiting rooms"
                value={flatsWithoutRooms}
                description="Cannot be listed yet"
              />
              <StatCard
                title="Active"
                value={
                  records.filter((record) => record.flat.status === "ACTIVE")
                    .length
                }
                description={`${properties.length} propert${
                  properties.length === 1 ? "y" : "ies"
                } owned`}
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Your flats
                </h2>
                <p className="text-sm text-muted-foreground">
                  {records.length === 0
                    ? "No flats yet"
                    : `${visible.length} of ${records.length} flat${
                        visible.length === 1 ? "" : "s"
                      } shown`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <TableSearch
                  label="Search flats"
                  placeholder="Flat number, property or area…"
                />
                <AddFlatDialog properties={properties} />
              </div>
            </div>

            {propertyFilter ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Filtered by property:
                </span>
                <Link
                  href={propertyFilterHref("")}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {properties.find((property) => property.id === propertyFilter)
                    ?.name ?? propertyFilter}
                </Link>
              </div>
            ) : null}

            {!canAddFlat ? (
              <p className="mt-3 text-sm text-muted-foreground">
                You need a property before you can add a flat to it.
              </p>
            ) : null}

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>All flats</CardTitle>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <BuildingIcon />
                      </EmptyMedia>
                      <EmptyTitle>No flats yet</EmptyTitle>
                      <EmptyDescription>
                        {canAddFlat
                          ? "Add your first flat to a property, then add rooms inside it."
                          : "Add a property first — a flat has to live inside one."}
                      </EmptyDescription>
                    </EmptyHeader>
                    {canAddFlat ? (
                      <AddFlatDialog properties={properties} />
                    ) : null}
                  </Empty>
                ) : visible.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
                    <EmptyMedia variant="icon">
                      <DoorOpenIcon />
                    </EmptyMedia>
                    <p className="text-sm font-medium">No flats match</p>
                    <p className="text-sm text-muted-foreground">
                      Try a different search term or clear the property filter.
                    </p>
                  </div>
                ) : (
                  <DataTable
                    data={visible}
                    columns={columns}
                    baseUrl="/owner/manage-flats"
                    rowKey={(record) => record.id}
                    itemLabel="flat"
                    emptyMessage="You do not own any flats yet."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />

      {selected ? (
        <FlatRoomsSheet
          flat={selected.flat}
          closeHref={propertyFilterHref(propertyFilter)}
        />
      ) : null}
    </>
  );
}
