import { ArrowLeftIcon, BedDoubleIcon, BuildingIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddRoomDialog } from "@/components/modules/owner/add-room-dialog";
import { FlatImagesDialog } from "@/components/modules/owner/flat-images-dialog";
import { FlatRoomCard } from "@/components/modules/owner/flat-room-card";
import { EditFlatButton } from "@/components/modules/owner/flat-row-actions";
import { OwnerNav } from "@/components/modules/owner/owner-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
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
import { type OwnerFlatRecord, primaryFlatImage } from "@/types";

export const metadata = {
  title: "Flat Details",
};

/**
 * `GET /owner/flats` has no single-flat route, so the detail page finds its record
 * in the owner list. `flatId` may be the flat's own id or the `PropertyOwnership`
 * row id — the list carries both — so either link works.
 */
function findFlatRecord(records: OwnerFlatRecord[], id: string) {
  return records.find(
    (record) =>
      record.flatId === id || record.id === id || record.flat.id === id,
  );
}

export default async function FlatDetailsPage({
  params,
}: PageProps<"/owner/flats/[flatId]">) {
  const { flatId } = await params;

  // The flat, its photos and its rooms all arrive in one payload, so this page is
  // a single round trip and needs no query params of its own.
  const flatsRes = await authedFetchJson<OwnerFlatRecord[]>("/owner/flats");
  const record = findFlatRecord(flatsRes.data ?? [], flatId);

  if (!record) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BuildingIcon />
                </EmptyMedia>
                <EmptyTitle>That flat is not in your list</EmptyTitle>
                <EmptyDescription>
                  It may belong to another owner, or it may have been removed.
                  Go back to your flats and pick another one.
                </EmptyDescription>
              </EmptyHeader>
              <Link
                href="/owner/manage-flats"
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                Back to manage flats
              </Link>
            </Empty>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const flat = record.flat;
  const rooms = flat.rooms ?? [];
  const cover = primaryFlatImage(flat.images);
  const propertyLabel = [flat.property?.name, flat.property?.area?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
            <Link
              href="/owner/manage-flats"
              className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              <ArrowLeftIcon aria-hidden="true" />
              All flats
            </Link>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    Flat {flat.flatNumber}
                  </h1>
                  <StatusBadge status={flat.status} />
                </div>

                <p className="text-sm text-muted-foreground text-pretty">
                  {propertyLabel || "No property attached"}
                </p>

                <OwnerNav activeHref="/owner/manage-flats" className="w-fit" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <EditFlatButton flat={flat} />
                <AddRoomDialog flat={flat} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
              <Card className="overflow-hidden">
                <div className="bg-muted relative aspect-4/3 w-full">
                  {cover ? (
                    <Image
                      src={cover.imageUrl}
                      alt={`Flat ${flat.flatNumber}`}
                      fill
                      sizes="(min-width: 1024px) 22rem, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground flex size-full items-center justify-center">
                      <BuildingIcon aria-hidden="true" className="size-8" />
                    </span>
                  )}
                </div>

                <CardContent className="grid gap-4">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Detail label="Bedrooms" value={flat.bedrooms ?? "—"} />
                    <Detail label="Bathrooms" value={flat.bathrooms ?? "—"} />
                    <Detail
                      label="Area"
                      value={formatAreaSqFt(flat.areaSqFt)}
                    />
                    <Detail label="Floor" value={flat.floorNumber ?? "—"} />
                    <Detail
                      label="Rooms"
                      value={`${rooms.length} room${rooms.length === 1 ? "" : "s"}`}
                    />
                    <Detail
                      label="Photos"
                      value={`${flat.images.length} photo${
                        flat.images.length === 1 ? "" : "s"
                      }`}
                    />
                  </dl>

                  {flat.description ? (
                    <p className="text-sm text-pretty">{flat.description}</p>
                  ) : null}

                  <FlatImagesDialog flat={flat} appearance="button" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rooms in this flat</CardTitle>
                </CardHeader>
                <CardContent>
                  {rooms.length === 0 ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <BedDoubleIcon />
                        </EmptyMedia>
                        <EmptyTitle>No rooms yet</EmptyTitle>
                        <EmptyDescription>
                          Rooms are what a tenant actually books, so this flat
                          cannot be listed until it has at least one.
                        </EmptyDescription>
                      </EmptyHeader>
                      <AddRoomDialog flat={flat} />
                    </Empty>
                  ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {rooms.map((room) => (
                        <FlatRoomCard
                          key={room.id}
                          room={room}
                          flatNumber={flat.flatNumber}
                        />
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/** One `label: value` pair of the flat's summary. */
function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
