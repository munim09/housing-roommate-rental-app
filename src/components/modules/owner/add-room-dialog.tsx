"use client";

import { PlusIcon, UploadIcon } from "lucide-react";
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
import { Field, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useCreateRoom } from "@/hooks";
import { toRoomPayload } from "@/lib/to-room-payload";
import type { OwnerFlat } from "@/types";
import { ROOM_IMAGE_RULES } from "@/validation";
import { ImagePicker, type SelectedImage } from "./image-picker";
import { RoomFormFields } from "./room-form-fields";
import { EMPTY_ROOM_VALUES, useRoomForm } from "./use-room-form";

export interface AddRoomDialogProps {
  /** The flat the room is created inside. Its number labels the dialog. */
  flat: OwnerFlat;
}

/**
 * `POST /owner/flats/:flatId/rooms` behind a modal.
 *
 * Same multipart shape as add-flat — the four room columns travel as a JSON
 * string in a `data` part and each photo is its own `images` part — so
 * `createRoom` builds the body and nothing here touches `FormData`. The upload
 * runs through `XMLHttpRequest` to report progress, which is why this dialog
 * carries a progress bar while add-flat, whose payload is usually one request,
 * does not need one.
 *
 * A duplicate `roomNumber` inside one flat answers with a Prisma error rather
 * than a field error, so that case is surfaced against the input that caused it.
 */
export function AddRoomDialog({ flat }: AddRoomDialogProps) {
  const router = useRouter();
  const createRoom = useCreateRoom();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [percent, setPercent] = useState(0);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const form = useRoomForm({
    defaultValues: { ...EMPTY_ROOM_VALUES },
    onSubmit: (values) => {
      setDuplicateError(null);
      createRoom.mutate(
        {
          flatId: flat.id,
          fields: toRoomPayload(values),
          images: images.map((image) => image.file),
          onProgress: (progress) => setPercent(progress.percent),
        },
        {
          onSuccess: (res) => {
            if (!res.success) {
              if (/duplicate|unique/i.test(res.message)) {
                setDuplicateError(
                  `${values.roomNumber.trim()} already exists in this flat.`,
                );

                return;
              }

              toast.add({
                title: "Server Failure",
                description: res.message ?? "The room was not added.",
                type: "error",
              });

              return;
            }

            toast.add({
              title: "Room added",
              description: `Room ${res.data.roomNumber} is ready to be listed.`,
              type: "success",
            });
            form.reset({ ...EMPTY_ROOM_VALUES });
            setImages([]);
            setPercent(0);
            setOpen(false);
            // Rooms are read as part of the flat list, which is a Server
            // Component read, so a cache invalidation alone would not repaint it.
            router.refresh();
          },
          onError: (err) => {
            setPercent(0);
            toast.add({
              title: "Could not add the room",
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDuplicateError(null);
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon aria-hidden="true" />
        Add room
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a room to flat {flat.flatNumber}</DialogTitle>
          <DialogDescription>
            A room is what a tenant actually books. Only the room number is
            required — the rest can be filled in later.
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
            <RoomFormFields
              form={form}
              idPrefix="add-room"
              disabled={createRoom.isPending}
            />

            {duplicateError ? (
              <Field data-invalid>
                <FieldError errors={[{ message: duplicateError }]} />
              </Field>
            ) : null}

            <ImagePicker
              images={images}
              onChange={setImages}
              disabled={createRoom.isPending}
              subject="room"
              rules={ROOM_IMAGE_RULES}
            />

            {createRoom.isPending ? (
              <div className="grid gap-1.5">
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>
                    Uploading {images.length} photo
                    {images.length === 1 ? "" : "s"}…
                  </span>
                  <span className="tabular-nums">{percent}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Room photo upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                  className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
                >
                  <div
                    className="bg-primary h-full transition-[width] duration-200"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={createRoom.isPending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createRoom.isPending}>
              {createRoom.isPending ? <Spinner /> : null}
              <UploadIcon aria-hidden="true" />
              Add room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
