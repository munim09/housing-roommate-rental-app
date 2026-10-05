"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom, updateRoom } from "@/api";
import type { UploadProgress } from "@/lib/upload-multipart";
import type { CreateRoomInput, UpdateRoomInput } from "@/types";
import { flatKeys } from "./flat.hook";

export interface CreateRoomVariables {
  flatId: string;
  fields: CreateRoomInput;
  images: File[];
  /** Forwarded to the uploader so the dialog can render a progress bar. */
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * `POST /owner/flats/:flatId/rooms`.
 *
 * A room is only ever read as part of its flat — `GET /owner/flats` nests it under
 * `flat.rooms` and there is no room collection — so both room writes invalidate
 * the flat list rather than a cache key of their own.
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flatId, fields, images, onProgress }: CreateRoomVariables) =>
      createRoom(flatId, fields, images, onProgress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flatKeys.all });
    },
  });
}

/** `PATCH /owner/rooms/:roomId`. The response echoes the row but not its images. */
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      payload,
    }: {
      roomId: string;
      payload: UpdateRoomInput;
    }) => updateRoom(roomId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: flatKeys.all });
    },
  });
}
