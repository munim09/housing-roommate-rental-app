import type { RentalType } from "./advertisement.type";

export const APPLICATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
  "EXPIRED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  EXPIRED: "Expired",
};

export const STAY_STATUSES = [
  "WAITING_FOR_PAYMENT",
  "CONFIRMED",
  "CANCELLED",
  "TERMINATED",
] as const;

export type StayStatus = (typeof STAY_STATUSES)[number];

export interface ApplicationApplicant {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ApplicationAdvertisementRef {
  id: string;
  title?: string | null;
  description?: string | null;
  rentalType?: RentalType | string | null;
  monthlyRent?: string | number | null;
  status?: string | null;
  flatId?: string | null;
  roomId?: string | null;
  createdBy?: ApplicationApplicant | null;
}

/** The stay row the backend attaches once an application is approved. */
export interface ApplicationStayRecord {
  id: string;
  status: StayStatus | string;
  startDate?: string | null;
  endDate?: string | null;
}

/**
 * `GET /manager/applications` — every application (and its stay, when one
 * exists) seen by the signed-in owner or manager.
 */
export interface OwnerManagerApplication {
  id: string;
  rentalType: RentalType | string;
  status: ApplicationStatus | string;
  requestedStartDate?: string | null;
  requestedEndDate?: string | null;
  note?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  applicant?: ApplicationApplicant | null;
  advertisement?: ApplicationAdvertisementRef | null;
  stay?: ApplicationStayRecord | null;
}
