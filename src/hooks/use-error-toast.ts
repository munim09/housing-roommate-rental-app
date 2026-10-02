"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import type { ApiError } from "@/types";

/**
 * Surfaces an API failure through a toast exactly once per distinct message.
 * Route-level crashes are still handled by `error.tsx` boundaries.
 */
export function useApiErrorToast(error: unknown, title = "Request failed") {
  const lastMessage = useRef<string | null>(null);

  useEffect(() => {
    if (!error) return;

    const apiError = error as ApiError;
    const message = apiError.message ?? "Something went wrong.";

    if (message === lastMessage.current) return;
    lastMessage.current = message;

    toast.add({ title, description: message, type: "error" });
  }, [error, title]);
}
