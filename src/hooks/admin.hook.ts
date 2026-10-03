"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createArea, createCity, updateUserStatus } from "@/api";
import type { AdminUserStatus } from "@/api/admin.api";
import { areaKeys, cityKeys } from "@/hooks/area.hook";
import type { CreateAreaInput, CreateCityInput } from "@/types";

export function useUpdateUserStatus() {
  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: AdminUserStatus;
    }) => updateUserStatus(userId, status),
  });
}

/** Creating a city can add an area to a new city, so both lists are stale. */
export function useCreateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCityInput) => createCity(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cityKeys.all });
      void queryClient.invalidateQueries({ queryKey: areaKeys.all });
    },
  });
}

export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAreaInput) => createArea(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: areaKeys.all });
      void queryClient.invalidateQueries({ queryKey: cityKeys.all });
    },
  });
}
