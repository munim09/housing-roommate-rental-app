"use client";

import { useMutation } from "@tanstack/react-query";
import { createArea, createCity, updateUserStatus } from "@/api";
import type { AdminUserStatus } from "@/api/admin.api";

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

export function useCreateCity() {
  return useMutation({
    mutationFn: createCity,
  });
}

export function useCreateArea() {
  return useMutation({
    mutationFn: createArea,
  });
}
