import { Building2Icon } from "lucide-react";
import Image from "next/image";
import { getManagerDashboardStats, getManagerFlats } from "@/api/manager.api";
import { ManagerNav } from "@/components/modules/manager/manager-nav";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatAreaSqFt, formatCurrency } from "@/lib/format";
import { getSessionClaims } from "@/lib/server-session";
import { type OwnerFlatRecord, primaryFlatImage } from "@/types";

export const metadata = {
  title: "Manager Dashboard",
};

export default async function ManagerDashboardPage() {
  const claims = await getSessionClaims();
  const managerId = claims?.userId ?? "";

  const [statsRes, flatsRes] = await Promise.all([
    getManagerDashboardStats(),
    getManagerFlats(),
  ]);

  const stats = statsRes?.data;
  const allFlats = flatsRes?.data ?? [];

  // The owner inventory answers with every flat on the account; a manager only
  // manages the ones an owner explicitly assigned, so the list is filtered by
  // the signed-in manager's id.
  const assignedFlats = managerId
    ? allFlats.filter((record) =>
        (record.flat.managerAssignments ?? []).some(
          (assignment) => assignment.manager.id === managerId,
        ),
      )
    : allFlats;
  const totalRooms = assignedFlats.reduce(
    (total, record) => total + (record.flat.rooms?.length ?? 0),
    0,
  );

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
            <span className="grid gap-0.5">
              <span className="font-medium">{record.flat.flatNumber}</span>
              <span className="text-xs text-muted-foreground">
                {record.flat.floorNumber
                  ? `Floor ${record.flat.floorNumber}`
                  : "—"}
              </span>
            </span>
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
      cell: (record) => record.flat.rooms?.length ?? 0,
    },
    {
      key: "status",
      header: "Status",
      cell: (record) => <StatusBadge status={record.status} />,
    },
  ];

  return (
    <>
      <section className="border-b">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Manager Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground text-pretty">
            The flats assigned to you, and what they have collected so far.
          </p>
          <ManagerNav activeHref="/manager/dashboard" className="mt-4 w-fit" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Assigned flats"
              value={stats?.totalAssignedFlats ?? assignedFlats.length}
              description="Units you manage"
            />
            <StatCard
              title="Active advertisements"
              value={stats?.activeAdvertisements ?? 0}
              description="Listings currently live"
            />
            <StatCard
              title="Rent this month"
              value={formatCurrency(stats?.rentCollectionThisMonth)}
              description="Collected for rent"
            />
            <StatCard
              title="Utility this month"
              value={formatCurrency(stats?.utilityCollectionThisMonth)}
              description="Collected for utilities"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Your assigned flats
            </h2>
            <p className="text-sm text-muted-foreground">
              {assignedFlats.length === 0
                ? "No flats have been assigned to you yet."
                : `${assignedFlats.length} flat${
                    assignedFlats.length === 1 ? "" : "s"
                  } · ${totalRooms} room${totalRooms === 1 ? "" : "s"}`}
            </p>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Assigned flats</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedFlats.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Building2Icon />
                    </EmptyMedia>
                    <EmptyTitle>No assigned flats yet</EmptyTitle>
                    <EmptyDescription>
                      When an owner assigns you a flat, it lands here with its
                      status and room breakdown.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <DataTable
                  data={assignedFlats}
                  columns={columns}
                  baseUrl="/manager/dashboard"
                  rowKey={(record) => record.id}
                  itemLabel="flat"
                  emptyMessage="No flats are assigned to you yet."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
