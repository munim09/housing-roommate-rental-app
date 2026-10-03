"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProperty } from "@/api";
import type { CreatePropertyInput } from "@/types";

export const propertyKeys = {
  all: ["owner", "properties"] as const,
  dashboard: ["owner", "dashboard"] as const,
};

/**
 * A new property changes both the owner's list and the dashboard counters, so
 * both caches are dropped. The dashboard is a Server Component read, so the
 * dialog also calls `router.refresh()` to re-render it with fresh stats.
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePropertyInput) => createProperty(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.all });
      void queryClient.invalidateQueries({ queryKey: propertyKeys.dashboard });
    },
  });
}
