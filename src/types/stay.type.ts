import type { RentalType } from "./advertisement.type";
import type { StayStatus } from "./application.type";
import type { Invoice, MoneyValue } from "./invoice.type";

export interface StayOccupant {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface StayProperty {
  id: string;
  name: string;
  address?: string | null;
}

export interface StayRoom {
  id: string;
  roomNumber?: string | null;
  name?: string | null;
}

export interface StayFlat {
  id: string;
  flatNumber?: string | null;
  rooms?: StayRoom[];
}

export interface StayApplicationRef {
  id: string;
  status: string;
  requestedStartDate?: string | null;
  requestedEndDate?: string | null;
  advertisement?: {
    id: string;
    title?: string | null;
    monthlyRent?: MoneyValue;
  } | null;
}

/**
 * `GET /tenant/stays` — reachable by `TENANT`, `OWNER` and `MANAGER`, so an
 * owner or manager can join the stay rows onto the applications they review.
 * Relations are optional because the payload shape differs between a primary
 * and a secondary (roommate) stay.
 */
export interface StayRecord {
  id: string;
  applicationId?: string | null;
  occupantId?: string | null;
  propertyId?: string | null;
  flatId?: string | null;
  roomId?: string | null;
  rentalType?: RentalType | string | null;
  status: StayStatus | string;
  startDate?: string | null;
  endDate?: string | null;
  monthlyRent?: MoneyValue | null;
  createdAt?: string;
  updatedAt?: string;
  application?: StayApplicationRef | null;
  occupant?: StayOccupant | null;
  property?: StayProperty | null;
  flat?: StayFlat | null;
  room?: StayRoom | null;
  /** PDF contract link; only present for confirmed primary stays. */
  contractUrl?: string | null;
  invoices?: Invoice[];
}
