"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFlat, updateFlat } from "@/api";
import type { CreateFlatInput, UpdateFlatInput } from "@/types";

export const flatKeys = {
  all: ["owner", "flats"] as const,
};

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
