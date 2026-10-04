"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface LightboxImage {
  /** Stable key — an `AccommodationImage` id, or a blob URL for a pending pick. */
  id: string;
  src: string;
  alt: string;
}

export interface ImageLightboxProps {
  images: LightboxImage[];
  /** Which photo to show, or `null` to keep the lightbox closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  title?: string;
}

/**
 * Full-size photo viewer.
 *
 * The index lives with the caller rather than in here, so "view" can be opened
 * from any thumbnail without this component owning which photo that was, and so
 * closing it is a plain state update instead of a second flag to keep in sync.
 *
 * Navigation wraps around, because the arrow buttons are the only way to reach
 * the last photo once the list is longer than the dialog is tall.
 */
export function ImageLightbox({
  images,
  index,
  onIndexChange,
  title = "Photos",
}: ImageLightboxProps) {
  const total = images.length;
  const current = index === null ? null : (images[index] ?? null);
  // The 1-based label shown in the header and the footer; only ever read while
  // `current` exists, where `index` is known to be a number.
  const position = index === null ? 0 : index + 1;

  const step = useCallback(
    (delta: number) => {
      if (index === null || total === 0) return;

      onIndexChange((index + delta + total) % total);
    },
    [index, onIndexChange, total],
  );

  // Arrow keys page through the set; Escape is the dialog's own job.
  useEffect(() => {
    if (index === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        step(1);
      }

      if (event.key === "ArrowLeft") {
        step(-1);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, step]);

  return (
    <Dialog
      open={current !== null}
      onOpenChange={(next) => {
        if (!next) onIndexChange(null);
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {current && total > 0
              ? `Photo ${position} of ${total}`
              : "Photo viewer"}
          </DialogDescription>
        </DialogHeader>

        {current ? (
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted">
            <Image
              // Remounting on index keeps the previous photo from lingering while
              // the next one is decoded.
              key={current.id}
              src={current.src}
              alt={current.alt}
              fill
              sizes="(min-width: 768px) 42rem, 100vw"
              className="object-contain"
            />
          </div>
        ) : null}

        {total > 1 ? (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => step(-1)}
              aria-label="Previous photo"
            >
              <ChevronLeftIcon aria-hidden="true" />
              Previous
            </Button>
            <span className="text-muted-foreground text-xs tabular-nums">
              {position} / {total}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => step(1)}
              aria-label="Next photo"
            >
              Next
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
