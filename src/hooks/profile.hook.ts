import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMe,
  type UpdateProfilePayload,
  updateProfile,
} from "@/api/profile.api";
import type { ApiError } from "@/types";

export const profileKeys = {
  me: ["profile", "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const res = await getMe();
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const res = await updateProfile(payload);
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}
