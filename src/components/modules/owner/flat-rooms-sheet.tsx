"use client";

import { BedDoubleIcon, RulerIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatAreaSqFt } from "@/lib/format";
import { type OwnerFlat, primaryFlatImage } from "@/types";
import { AddRoomDialog } from "./add-room-dialog";
import { FlatImagesDialog } from "./flat-images-dialog";
import { EditFlatButton } from "./flat-row-actions";

export interface FlatRoomsSheetProps {
  /** The flat whose rooms are listed. Its `rooms` come straight from the list call. */
  flat: OwnerFlat;
  /**
   * The current URL with `flatId` removed. Closing writes this back, so the
   * drawer lives in the address bar and a refresh or a shared link reopens it.
   */
  closeHref: string;
}

/**
 * Quick room peek for one flat.
 *
 * This is not a separate request: `GET /owner/flats` embeds each flat's `rooms`,
 * so selecting a flat is a matter of finding the matching record in the payload
 * the page already fetched. Opening it is therefore a URL change
 * (`?flatId=…`), which keeps the drawer deep-linkable and lets the Server
 * Component resolve it.
 *
 * Rooms can be added from here, but each one is edited on the flat's own detail
 * page — `/owner/flats/:id` — which has the room's photos alongside its columns.
 */
export function FlatRoomsSheet({ flat, closeHref }: FlatRoomsSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const rooms = flat.rooms ?? [];
  const propertyLabel = [flat.property?.name, flat.property?.area?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) router.replace(closeHref, { scroll: false });
      }}
    >
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            Flat {flat.flatNumber}
            {flat.floorNumber == null ? null : (
              <span className="text-muted-foreground font-normal">
                {" "}
                · Floor {flat.floorNumber}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {propertyLabel || "Rooms in this flat"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={flat.status} />
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <BedDoubleIcon aria-hidden="true" />
            {flat.bedrooms ?? "—"} beds · {flat.bathrooms ?? "—"} baths
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <RulerIcon aria-hidden="true" />
            {formatAreaSqFt(flat.areaSqFt)}
          </span>
        </div>

        {flat.description ? (
          <p className="text-muted-foreground text-sm">{flat.description}</p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <h3 className="mb-3 text-sm font-medium">
            Rooms{" "}
            <span className="text-muted-foreground">({rooms.length})</span>
          </h3>

          {rooms.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
              <BedDoubleIcon
                aria-hidden="true"
                className="text-muted-foreground size-6"
              />
              <p className="text-sm font-medium">No rooms yet</p>
              <p className="text-muted-foreground text-sm">
                Rooms are what a tenant actually books, so this flat cannot be
                listed until it has at least one.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {rooms.map((room) => {
                const image = primaryFlatImage(room.images);

                return (
                  <li
                    key={room.id}
                    className="flex gap-3 rounded-lg border p-3"
                  >
                    <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md">
                      {image ? (
                        <Image
                          src={image.imageUrl}
                          alt={`Room ${room.roomNumber}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground flex size-full items-center justify-center">
                          <BedDoubleIcon
                            aria-hidden="true"
                            className="size-5"
                          />
                        </span>
                      )}
                    </div>
                    <div className="grid flex-1 content-start gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          Room {room.roomNumber}
                        </p>
                        <StatusBadge status={room.status} />
                      </div>
                      {room.name ? (
                        <p className="text-muted-foreground text-sm">
                          {room.name}
                        </p>
                      ) : null}
                      <p className="text-muted-foreground text-xs">
                        {room.images.length > 0
                          ? `${room.images.length} photo${room.images.length === 1 ? "" : "s"}`
                          : "No photos"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <SheetFooter>
          <AddRoomDialog flat={flat} />
          {/* Same photo manager as the table row, so a flat's images can be
              changed without leaving the drawer. */}
          <FlatImagesDialog flat={flat} />
          <EditFlatButton flat={flat} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
