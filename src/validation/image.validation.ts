/**
 * Upload rules shared by every image field in the owner surface.
 *
 * Flats and rooms are uploaded through the same Multer memory storage with the
 * same limits, so the checks live here once and each endpoint passes in its own
 * per-request file cap. They mirror the backend rather than replace it: an
 * oversized or unsupported file is refused before the request is made, and the
 * server still has the final say.
 */

/** The `images` parts are uploaded raw, so the browser's own types are checked. */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** `accept` attribute for the file picker. */
export const IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");

/**
 * What a picker needs to enforce one endpoint's upload rules: the cap it shows
 * and disables at, and the check that refuses a bad batch.
 */
export interface ImageUploadRules {
  /** Per-request file cap the endpoint enforces. */
  max: number;
  validate: (files: File[]) => string | null;
}

/** The first problem with this batch of files, or `null` when it is uploadable. */
export function validateImageFiles(files: File[], max: number) {
  if (files.length > max) {
    return `You can upload at most ${max} images.`;
  }

  const wrongType = files.find(
    (file) => !ACCEPTED_IMAGE_TYPES.includes(file.type),
  );

  if (wrongType) {
    return `“${wrongType.name}” is not a JPG, PNG or WebP image.`;
  }

  const tooBig = files.find((file) => file.size > MAX_IMAGE_BYTES);

  if (tooBig) {
    return `“${tooBig.name}” is larger than 5 MB.`;
  }

  return null;
}
