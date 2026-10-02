import apiClient, { cleanParams } from "@/lib/api-client";
import type { ApiResponse, Meta } from "@/types";

/** Statuses an admin can assign. `REJECTED` is read-only in the UI. */
export const ADMIN_USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;

export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

/** Every status the backend can hold, including the non-selectable ones. */
export type StoredUserStatus =
  | AdminUserStatus
  | "PENDING_APPROVAL"
  | "REJECTED";

export interface DashboardStats {
  users: number;
  properties: number;
  flats: number;
  activeAdvertisements: number;
  currentConfirmedStays: number;
  activeOwners: number;
  activeManagers: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "OWNER" | "MANAGER" | "TENANT";
  status: StoredUserStatus;
  emailVerified: boolean;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
  ownerProfile: unknown | null;
  managerProfile: unknown | null;
  tenantProfile: unknown | null;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  meta?: Meta;
}

export function getDashboardStats(headers?: HeadersInit) {
  return apiClient<ApiResponse<DashboardStats>>("/admin/dashboard", {
    method: "GET",
    credentials: "include",
    headers,
  });
}

export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: AdminUserStatus;
}

export function getAdminUsers(params?: AdminUserQuery, headers?: HeadersInit) {
  return apiClient<ApiResponse<AdminUser[]>>("/admin/users/profiles", {
    method: "GET",
    params: cleanParams(params),
    credentials: "include",
    headers,
  });
}

export function createCity(payload: { name: string }) {
  return apiClient<ApiResponse<{ id: string; name: string }>>("/admin/cities", {
    method: "POST",
    body: payload,
  });
}

export function createArea(payload: { name: string; cityId: string }) {
  return apiClient<ApiResponse<{ id: string; name: string; cityId: string }>>(
    "/admin/areas",
    {
      method: "POST",
      body: payload,
    },
  );
}

export function updateUserStatus(userId: string, status: AdminUserStatus) {
  return apiClient<ApiResponse<{ id: string; status: AdminUserStatus }>>(
    `/admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
}
