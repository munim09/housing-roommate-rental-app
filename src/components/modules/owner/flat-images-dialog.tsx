"use client";

import { EyeIcon, ImagesIcon, Trash2Icon, UploadIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MAX_FLAT_IMAGES } from "@/api";
import {
  ImageLightbox,
  type LightboxImage,
} from "@/components/shared/image-lightbox";
import { Badge } from "@/components/ui/badge";
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
import { useAddFlatImages, useRemoveFlatImage } from "@/hooks";
import type { FlatImage, OwnerFlat } from "@/types";
import { FLAT_IMAGE_RULES } from "@/validation";
import { ImagePicker, type SelectedImage } from "./image-picker";

export interface FlatImagesDialogProps {
  flat: OwnerFlat;
  /**
   * How the trigger is drawn: `"icon"` is the square row/footer affordance, while
   * `"button"` labels it with the photo count for pages where photo management is
   * one of the flat's named actions.
   */
  appearance?: "icon" | "button";
}

/**
 * Photo management for a single flat.
 *
 * Both writes are separate backend routes with separate shapes: uploading is a
 * `multipart/form-data` `POST` to `/owner/flats/:flatId/images` that answers with
 * the new Cloudinary URLs, while removing is a bodiless `DELETE` to
 * `/owner/flats/:flatId/images/:imageId` keyed on the `AccommodationImage` id from
 * `GET /owner/flats`. Neither response carries the flat, so the list is refetched
 * after each change — the rows here are a Server Component read, hence
 * `router.refresh()` on top of the mutation's cache invalidation.
 */
export function FlatImagesDialog({
  flat,
  appearance = "icon",
}: FlatImagesDialogProps) {
  const router = useRouter();
  const addImages = useAddFlatImages();
  const removeImage = useRemoveFlatImage();

  const [open, setOpen] = useState(false);
  /** Files chosen but not uploaded yet — the picker's `File` + preview pairs. */
  const [staged, setStaged] = useState<SelectedImage[]>([]);
  const [percent, setPercent] = useState(0);
  /** The photo a removal has been asked for but not confirmed yet. */
  const [pendingRemoval, setPendingRemoval] = useState<FlatImage | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  const [images, setImages] = useState(flat.images);

  // The refreshed Server Component payload is the source of truth, so a stale
  // local list is replaced whenever the parent hands over a new one.
  useEffect(() => {
    setImages(flat.images);
  }, [flat.images]);

  const busy = addImages.isPending || removeImage.isPending;
  const lightboxImages: LightboxImage[] = images.map((image, position) => ({
    id: image.id,
    src: image.imageUrl,
    alt: `Flat ${flat.flatNumber} photo ${position + 1}`,
  }));

  function upload() {
    if (staged.length === 0) return;

    setPercent(0);
    addImages.mutate(
      {
        flatId: flat.id,
        images: staged.map((image) => image.file),
        onProgress: (progress) => setPercent(progress.percent),
      },
      {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Server Failure",
              description: res.message ?? "The photos were not uploaded.",
              type: "error",
            });

            return;
          }

          const added = res.data?.length ?? staged.length;

          toast.add({
            title: "Photos added",
            description: `${added} photo${added === 1 ? "" : "s"} added to flat ${flat.flatNumber}.`,
            type: "success",
          });
          setStaged([]);
          setPercent(0);
          router.refresh();
        },
        onError: (err) => {
          setPercent(0);
          toast.add({
            title: "Could not upload the photos",
            description:
              err.message ?? "Something went wrong. Please try again.",
            type: "error",
          });
        },
      },
    );
  }

  function confirmRemoval() {
    if (!pendingRemoval) return;

    removeImage.mutate(
      { flatId: flat.id, imageId: pendingRemoval.id },
      {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Server Failure",
              description: res.message ?? "The photo was not removed.",
              type: "error",
            });

            return;
          }

          toast.add({
            title: "Photo removed",
            description: `Flat ${flat.flatNumber} no longer shows that photo.`,
            type: "success",
          });
          setPendingRemoval(null);
          // Drop it now rather than waiting for the refetch, so the grid matches
          // what the server just accepted.
          setImages((current) =>
            current.filter((image) => image.id !== pendingRemoval.id),
          );
          router.refresh();
        },
        onError: (err) => {
          toast.add({
            title: "Could not remove the photo",
            description:
              err.message ?? "Something went wrong. Please try again.",
            type: "error",
          });
        },
      },
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setPendingRemoval(null);
        }}
      >
        {/* `render` supplies the button itself so it matches the row's other
            actions; the children are the trigger's own content. */}
        <DialogTrigger
          render={
            appearance === "button" ? (
              <Button variant="outline" />
            ) : (
              <Button variant="ghost" size="icon-sm" />
            )
          }
        >
          <ImagesIcon aria-hidden="true" />
          {appearance === "button" ? (
            `Photos (${images.length})`
          ) : (
            <span className="sr-only">
              Manage photos of flat {flat.flatNumber}
            </span>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Photos · Flat {flat.flatNumber}</DialogTitle>
            <DialogDescription>
              Add more photos to this flat, or remove the ones that should no
              longer be shown. Up to {MAX_FLAT_IMAGES} photos per upload.
            </DialogDescription>
          </DialogHeader>

          {pendingRemoval ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
              <p className="text-sm">
                Remove this photo? It disappears from every listing of this
                flat.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={removeImage.isPending}
                  onClick={() => setPendingRemoval(null)}
                >
                  Keep it
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={removeImage.isPending}
                  onClick={confirmRemoval}
                >
                  {removeImage.isPending ? (
                    <Spinner />
                  ) : (
                    <Trash2Icon aria-hidden="true" />
                  )}
                  Remove photo
                </Button>
              </div>
            </div>
          ) : null}

          <section className="grid gap-3">
            <h3 className="text-sm font-medium">
              Current photos{" "}
              <span className="text-muted-foreground">({images.length})</span>
            </h3>

            {images.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
                <ImagesIcon
                  aria-hidden="true"
                  className="text-muted-foreground size-6"
                />
                <p className="text-sm font-medium">No photos yet</p>
                <p className="text-muted-foreground text-sm">
                  Upload the first one below — listings with photos get far more
                  interest than bare ones.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image, position) => (
                  <li
                    key={image.id}
                    className="group relative aspect-4/3 overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`Flat ${flat.flatNumber} photo ${position + 1}`}
                      fill
                      sizes="(min-width: 640px) 13rem, 10rem"
                      className="object-cover"
                    />

                    {image.isPrimary ? (
                      <Badge
                        variant="secondary"
                        className="absolute top-1 left-1"
                      >
                        Primary
                      </Badge>
                    ) : null}

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-linear-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon-xs"
                        aria-label={`View photo ${position + 1} of flat ${flat.flatNumber}`}
                        onClick={() => setViewingIndex(position)}
                      >
                        <EyeIcon aria-hidden="true" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-xs"
                        aria-label={`Remove photo ${position + 1} of flat ${flat.flatNumber}`}
                        disabled={busy}
                        onClick={() => setPendingRemoval(image)}
                      >
                        <Trash2Icon aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ImagePicker
            images={staged}
            onChange={setStaged}
            disabled={addImages.isPending}
            subject="flat"
            rules={FLAT_IMAGE_RULES}
          />

          {addImages.isPending ? (
            <div className="grid gap-1.5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  Uploading {staged.length} photo
                  {staged.length === 1 ? "" : "s"}…
                </span>
                <span className="tabular-nums">{percent}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Photo upload progress"
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

          <DialogFooter className="mt-1">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={busy}
            >
              Close
            </DialogClose>
            <Button
              type="button"
              disabled={staged.length === 0 || busy}
              onClick={upload}
            >
              {addImages.isPending ? (
                <Spinner />
              ) : (
                <UploadIcon aria-hidden="true" />
              )}
              {staged.length > 0
                ? `Upload ${staged.length} photo${staged.length === 1 ? "" : "s"}`
                : "Upload photos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        images={lightboxImages}
        index={viewingIndex}
        onIndexChange={setViewingIndex}
        title={`Flat ${flat.flatNumber} photos`}
      />
    </>
  );
}
