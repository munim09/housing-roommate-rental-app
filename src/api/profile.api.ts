import apiClient from "@/lib/api-client";
import type { ApiResponse, AuthUser } from "@/types";

export interface MeResponse extends AuthUser {
  phone: string;
  emailVerified: boolean;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
  ownerProfile: {
    id: string;
    userId: string;
    nid?: string | null;
    address?: string | null;
    occupation?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  managerProfile: {
    id: string;
    userId: string;
    nid?: string | null;
    address?: string | null;
    occupation?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  tenantProfile: {
    id: string;
    userId: string;
    nid?: string | null;
    address?: string | null;
    occupation?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface UpdateProfilePayload {
  nid?: string | null;
  address?: string | null;
  occupation?: string | null;
}

export function getMe() {
  return apiClient<ApiResponse<MeResponse>>("/auth/me", { method: "GET" });
}

export function updateProfile(payload: UpdateProfilePayload) {
  return apiClient<ApiResponse<MeResponse>>("/auth/update-profile", {
    method: "PATCH",
    body: payload,
  });
}
