"use client";

import { cn } from "cn";
import { BedDoubleIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  ImageLightbox,
  type LightboxImage,
} from "@/components/shared/image-lightbox";
import type { AdvertisementImage } from "@/types";

export function ListingGallery({
  images,
  title,
}: {
  images: AdvertisementImage[];
  title: string;
}) {
  // The primary photo leads, then the owner's sortOrder.
  const photos: LightboxImage[] = [...images]
    .sort(
      (a, b) =>
        Number(b.isPrimary ?? false) - Number(a.isPrimary ?? false) ||
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )
    .map((image) => ({ id: image.id, src: image.imageUrl, alt: title }));

  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-16/10 w-full items-center justify-center rounded-2xl bg-muted">
        <div className="grid justify-items-center gap-2 text-muted-foreground">
          <BedDoubleIcon className="size-8" aria-hidden="true" />
          <p className="text-sm">No photos published yet</p>
        </div>
      </div>
    );
  }

  const safeActive = Math.min(active, photos.length - 1);
  const current = photos[safeActive];

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => setLightboxIndex(safeActive)}
        className="relative block aspect-16/10 w-full overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View photos of ${title}`}
      >
        <Image
          key={current.id}
          src={current.src}
          alt={title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute end-3 bottom-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium tabular-nums backdrop-blur">
          {safeActive + 1} / {photos.length}
        </span>
      </button>

      {photos.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === safeActive}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted transition-opacity",
                  index === safeActive
                    ? "ring-2 ring-primary"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="4rem"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <ImageLightbox
        images={photos}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        title={title}
      />
    </div>
  );
}
