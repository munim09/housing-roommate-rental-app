import { ImageIcon, RulerIcon } from "lucide-react";
import Image from "next/image";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatAreaSqFt } from "@/lib/format";
import { type FlatRoom, primaryFlatImage } from "@/types";
import { EditRoomDialog } from "./edit-room-dialog";

export interface FlatRoomCardProps {
  room: FlatRoom;
  /** Names the parent flat in the update dialog's title. */
  flatNumber: string;
}

/**
 * One room inside a flat, with its own update action.
 *
 * Rendered on the server — the room list comes out of the same `GET /owner/flats`
 * payload as the flat — with only the update dialog crossing into the client, so
 * adding, editing or removing a room anywhere on the page repaints it through
 * `router.refresh()` rather than a client cache.
 */
export function FlatRoomCard({ room, flatNumber }: FlatRoomCardProps) {
  const photo = primaryFlatImage(room.images);

  return (
    <li className="flex flex-col gap-3 rounded-xl border p-3">
      <div className="bg-muted relative aspect-4/3 w-full overflow-hidden rounded-lg">
        {photo ? (
          <Image
            src={photo.imageUrl}
            alt={`Room ${room.roomNumber}`}
            fill
            sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <span className="text-muted-foreground flex size-full items-center justify-center">
            <ImageIcon aria-hidden="true" className="size-6" />
          </span>
        )}
      </div>

      <div className="grid flex-1 content-start gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">Room {room.roomNumber}</p>
          <StatusBadge status={room.status} />
        </div>

        {room.name ? (
          <p className="text-sm text-muted-foreground">{room.name}</p>
        ) : null}

        <p className="text-muted-foreground text-xs">
          {room.images.length > 0
            ? `${room.images.length} photo${room.images.length === 1 ? "" : "s"}`
            : "No photos"}
          {room.areaSqFt == null || room.areaSqFt === "" ? null : (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">·</span>
              <RulerIcon aria-hidden="true" />
              {formatAreaSqFt(room.areaSqFt)}
            </span>
          )}
        </p>

        {room.description ? (
          <p className="text-sm">{room.description}</p>
        ) : null}

        <div className="mt-1 flex justify-end">
          <EditRoomDialog room={room} flatNumber={flatNumber} />
        </div>
      </div>
    </li>
  );
}
