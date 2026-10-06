import { authedFetchJson } from "@/lib/auth-fetched";
import type {
  ApiResponse,
  ManagerDashboardStats,
  OwnerFlatRecord,
} from "@/types";

/** `GET /manager/dashboard` — the manager's own stat block. */
export function getManagerDashboardStats() {
  return authedFetchJson<ApiResponse<ManagerDashboardStats>>(
    "/manager/dashboard",
  );
}

/** `GET /owner/flats` — full flat inventory, allowed for `MANAGER` too. */
export function getManagerFlats() {
  return authedFetchJson<ApiResponse<OwnerFlatRecord[]>>("/owner/flats");
}
