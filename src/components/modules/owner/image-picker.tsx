"use client";

import { ImagePlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { IMAGE_ACCEPT, type ImageUploadRules } from "@/validation";

/**
 * A picked file and the blob URL previewing it.
 *
 * The two are stored as one object rather than as two parallel arrays. Keeping
 * `File[]` and `string[]` in separate state let them drift: removing a file
 * updated `files` immediately but `previews` only on the next effect pass, so one
 * render saw `previews.length > files.length` and crashed on `files[index].name`.
 */
export interface SelectedImage {
  file: File;
  url: string;
}

export interface ImagePickerProps {
  images: SelectedImage[];
  onChange: (images: SelectedImage[]) => void;
  disabled?: boolean;
  /** Noun for the label and the input's accessible name — "flat", "room". */
  subject: string;
  /** Per-request file cap, which differs per endpoint, plus its validator. */
  rules: ImageUploadRules;
}

/**
 * Multi-file picker for the `images` parts of a multipart body.
 *
 * The files are held here rather than in the TanStack form because a `File`
 * cannot be a controlled input value and the backend only needs them at submit
 * time. Validation mirrors the server rules so an unsupported or oversized file
 * is refused before the request is made.
 */
export function ImagePicker({
  images,
  onChange,
  disabled,
  subject,
  rules,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Blob URLs outlive the render that minted them, so they must be released or
  // the page leaks one per pick. Keeping the previous list in a ref lets a single
  // effect revoke anything that has left the list, whether it was removed with
  // the cross button or cleared by the dialog after a successful submit. That
  // also means `removeImage` does not have to know about URL lifetimes.
  const imagesRef = useRef<SelectedImage[]>([]);

  useEffect(() => {
    for (const image of imagesRef.current) {
      const stillSelected = images.some((current) => current.url === image.url);

      if (!stillSelected) URL.revokeObjectURL(image.url);
    }

    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    // Whatever is still held when the dialog closes.
    return () => {
      for (const image of imagesRef.current) {
        URL.revokeObjectURL(image.url);
      }
    };
  }, []);

  function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;

    const accepted = Array.from(incoming);
    const problem = rules.validate([
      ...images.map((image) => image.file),
      ...accepted,
    ]);

    if (problem) {
      setError(problem);
      // Let the same file be picked again once the mistake is corrected.
      if (inputRef.current) inputRef.current.value = "";

      return;
    }

    setError(null);
    onChange([
      ...images,
      ...accepted.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  }

  function removeImage(index: number) {
    setError(null);
    onChange(images.filter((_, position) => position !== index));
  }

  const atLimit = images.length >= rules.max;

  return (
    <Field data-invalid={Boolean(error)}>
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-1">
          <span className="font-medium">Photos</span>
          <span className="text-muted-foreground text-xs">
            Optional. Up to {rules.max} images, JPG, PNG or WebP, 5 MB each.
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || atLimit}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlusIcon aria-hidden="true" />
          {images.length > 0 ? "Add more" : "Add photos"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="sr-only"
        aria-label={`${subject} photos`}
        onChange={(event) => addFiles(event.target.files)}
      />

      {error ? <FieldError errors={[{ message: error }]} /> : null}

      {images.length > 0 ? (
        <ul className="mt-1 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <li
              // Each object URL is minted once per pick, so it is unique.
              key={image.url}
              className="group relative aspect-4/3 overflow-hidden rounded-lg border"
            >
              <Image
                src={image.url}
                alt={`Selected photo ${index + 1}: ${image.file.name}`}
                fill
                sizes="160px"
                className="object-cover"
                unoptimized
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                aria-label={`Remove ${image.file.name}`}
                className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                onClick={() => removeImage(index)}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </Field>
  );
}
