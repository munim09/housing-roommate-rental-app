"use client";

import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUpdateRoom } from "@/hooks";
import { toRoomPayload } from "@/lib/to-room-payload";
import type { FlatRoom } from "@/types";
import type { RoomValues } from "@/validation";
import { RoomFormFields } from "./room-form-fields";
import { useRoomForm } from "./use-room-form";

export interface EditRoomDialogProps {
  room: FlatRoom;
  /** Names the parent flat in the title, e.g. "Update room B1-04 · flat C2". */
  flatNumber?: string;
  /** Rendered as the card's action button when the dialog has no trigger of its own. */
  trigger?: React.ReactNode;
}

/**
 * Pre-fills the form from the room.
 *
 * `GET /owner/flats` embeds rooms with `roomNumber` and `name` only, so the area
 * and description boxes start empty rather than guessing. `toRoomPayload` omits
 * anything left blank, which means an update that only renames a room cannot
 * silently wipe the two columns the list never returned.
 */
function toRoomFormValues(room: FlatRoom): RoomValues {
  return {
    roomNumber: room.roomNumber,
    name: room.name ?? "",
    areaSqFt:
      room.areaSqFt == null || room.areaSqFt === ""
        ? ""
        : String(room.areaSqFt),
    description: room.description ?? "",
  };
}

/**
 * `PATCH /owner/rooms/:roomId` behind a modal. Plain JSON — no `data` wrapper and
 * no files, so photos are managed separately from the room's columns.
 */
export function EditRoomDialog({
  room,
  flatNumber,
  trigger,
}: EditRoomDialogProps) {
  const router = useRouter();
  const updateRoom = useUpdateRoom();
  const [open, setOpen] = useState(false);

  const form = useRoomForm({
    defaultValues: toRoomFormValues(room),
    onSubmit: (values) => {
      updateRoom.mutate(
        { roomId: room.id, payload: toRoomPayload(values) },
        {
          onSuccess: (res) => {
            if (!res.success) {
              toast.add({
                title: "Server Failure",
                description: res.message ?? "The room was not updated.",
                type: "error",
              });

              return;
            }

            toast.add({
              title: "Room updated",
              description: `Room ${res.data.roomNumber} has been saved.`,
              type: "success",
            });
            setOpen(false);
            // The room card is a Server Component read, so the cache
            // invalidation from the mutation is not enough on its own.
            router.refresh();
          },
          onError: (err) => {
            toast.add({
              title: "Could not update the room",
              description:
                err.message ?? "Something went wrong. Please try again.",
              type: "error",
            });
          },
        },
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        {trigger ?? <PencilIcon aria-hidden="true" />}
        Update room
        <span className="sr-only">
          {" "}
          {room.roomNumber}
          {flatNumber ? ` in flat ${flatNumber}` : ""}
        </span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Update room {room.roomNumber}
            {flatNumber ? (
              <span className="text-muted-foreground font-normal">
                {" "}
                · Flat {flatNumber}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            Changes save straight away and apply to the live listing.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="grid gap-5">
            {/* Area and description are not embedded in the room list, so say so
                instead of letting the empty boxes look accidentally cleared. */}
            <p className="text-muted-foreground text-xs">
              Area and description are not part of the room list, so those boxes
              start empty. Leave one blank to keep the value already stored.
            </p>

            <RoomFormFields
              form={form}
              idPrefix="edit-room"
              disabled={updateRoom.isPending}
            />
          </div>

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={updateRoom.isPending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={updateRoom.isPending}>
              {updateRoom.isPending ? <Spinner /> : null}
              <PencilIcon aria-hidden="true" />
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
