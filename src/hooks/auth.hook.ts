"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { login, register, verifyEmail } from "@/api";
import { readStoredUser } from "@/lib/session";

export const authKeys = {
  all: ["auth"] as const,
  session: ["auth", "session"] as const,
};

/**
 * The backend exposes no `/auth/me` route, so the signed-in user is whatever
 * `/login` returned, read back from storage and never refetched.
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: async () => readStoredUser(),
    initialData: readStoredUser,
    staleTime: Infinity,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}
