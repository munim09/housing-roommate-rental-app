import type { MoneyValue } from "./invoice.type";

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type MaintenanceStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export const MAINTENANCE_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const;

export const MAINTENANCE_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

/** UI copy for the maintenance lifecycle, shared by both role surfaces. */
export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> =
  {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  };

/** Stay summary embedded in every maintenance request payload. */
export interface MaintenanceStayRef {
  id: string;
  status?: string | null;
  rentalType?: string | null;
  property?: {
    id: string;
    name?: string | null;
    address?: string | null;
  } | null;
  flat?: { id: string; flatNumber?: string | null } | null;
  room?: {
    id: string;
    roomNumber?: string | null;
    name?: string | null;
  } | null;
}

export interface MaintenanceReporter {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

/**
 * `GET /tenant/maintenance-requests` — one row per reported problem, with the
 * stay it belongs to and the tenant who reported it nested in. The backend
 * fills `scheduledFor` / `resolvedAt` once a manager picks the job up.
 */
export interface MaintenanceRequest {
  id: string;
  stayId: string;
  issue: string;
  description?: string | null;
  images?: string[];
  status: MaintenanceStatus | string;
  priority: MaintenancePriority | string;
  reportedById: string;
  scheduledFor?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  stay?: MaintenanceStayRef | null;
  reportedBy?: MaintenanceReporter | null;
  advertisement?: {
    id: string;
    title?: string | null;
    monthlyRent?: MoneyValue;
  } | null;
}
