"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFlatImages, createFlat, removeFlatImage, updateFlat } from "@/api";
import type { UploadProgress } from "@/lib/upload-multipart";
import type {
  CreateFlatInput,
  OwnerFlatRecord,
  UpdateFlatInput,
} from "@/types";

export const flatKeys = {
  all: ["owner", "flats"] as const,
};

/** `GET /owner/flats` — the full inventory; `OWNER` or `MANAGER`. */
export function useOwnerFlats() {
  return useQuery({
    queryKey: flatKeys.all,
    queryFn: async () => {
      const { getOwnerFlats } = await import("@/api");
      const { data } = await getOwnerFlats();
      return (data ?? []) as OwnerFlatRecord[];
    },
  });
}

/** Both writes change the owner flat list, so that cache is always dropped. */
function useInvalidateFlats() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: flatKeys.all });
  };
}

export interface CreateFlatVariables {
  propertyId: string;
  fields: CreateFlatInput;
  images: File[];
}

/**
 * `POST /properties/:propertyId/flats`. Invalidates the flat list *and* the
 * owner properties cache, because the new flat also shows up nested under its
 * property on the dashboard.
 */
export function useCreateFlat() {
  const invalidateFlats = useInvalidateFlats();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, fields, images }: CreateFlatVariables) =>
      createFlat(propertyId, fields, images),
    onSuccess: () => {
      invalidateFlats();
      void queryClient.invalidateQueries({ queryKey: ["owner", "properties"] });
    },
  });
}

/** `PATCH /flats/:flatId`. The response echoes the row but not its relations. */
export function useUpdateFlat() {
  const invalidateFlats = useInvalidateFlats();

  return useMutation({
    mutationFn: ({
      flatId,
      payload,
    }: {
      flatId: string;
      payload: UpdateFlatInput;
    }) => updateFlat(flatId, payload),
    onSuccess: invalidateFlats,
  });
}

export interface AddFlatImagesVariables {
  flatId: string;
  images: File[];
  /** Forwarded to the uploader so the dialog can render a progress bar. */
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * `POST /owner/flats/:flatId/images`.
 *
 * The response holds only the new URLs, so the flat list is invalidated to pick
 * up the `AccommodationImage` rows — and their ids, which the delete route needs.
 */
export function useAddFlatImages() {
  const invalidateFlats = useInvalidateFlats();

  return useMutation({
    mutationFn: ({ flatId, images, onProgress }: AddFlatImagesVariables) =>
      addFlatImages(flatId, images, onProgress),
    onSuccess: invalidateFlats,
  });
}

/**
 * `DELETE /owner/flats/:flatId/images/:imageId`. Same reason for invalidating:
 * a delete changes both the photo list and which image is primary.
 */
export function useRemoveFlatImage() {
  const invalidateFlats = useInvalidateFlats();

  return useMutation({
    mutationFn: ({ flatId, imageId }: { flatId: string; imageId: string }) =>
      removeFlatImage(flatId, imageId),
    onSuccess: invalidateFlats,
  });
}

export function useAssignManager() {
  const invalidateFlats = useInvalidateFlats();

  return useMutation({
    mutationFn: ({
      flatId,
      managerId,
    }: {
      flatId: string;
      managerId: string;
    }) => import("@/api").then((m) => m.assignManager(flatId, managerId)),
    onSuccess: invalidateFlats,
  });
}

export function useRevokeManager() {
  const invalidateFlats = useInvalidateFlats();

  return useMutation({
    mutationFn: ({ flatId }: { flatId: string }) =>
      import("@/api").then((m) => m.revokeManager(flatId)),
    onSuccess: invalidateFlats,
  });
}
