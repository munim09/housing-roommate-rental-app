import type { ResourceStatus } from "./property.type";

/** `AccommodationImage` row. `isPrimary` picks the one to show in a list. */
export interface FlatImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface FlatManager {
  id: string;
  name: string;
  email: string;
}

export interface FlatManagerAssignment {
  id: string;
  manager: FlatManager;
}

/**
 * Room identity fields only. `GET /owner/properties` embeds rooms without their
 * images, so this is the shape that endpoint can satisfy.
 */
export interface FlatRoomSummary {
  id: string;
  roomNumber: string;
  name?: string | null;
  status: ResourceStatus;
}

/** A room as `GET /owner/flats` returns it, images included. */
export interface FlatRoom extends FlatRoomSummary {
  images: FlatImage[];
}

/** The property a flat hangs off, with just enough location to label a row. */
export interface FlatPropertyRef {
  id: string;
  name: string;
  area?: {
    id: string;
    cityId: string;
    name: string;
  } | null;
}

export interface OwnerFlat {
  id: string;
  flatNumber: string;
  status: ResourceStatus;
  /** `Decimal(10,2)` column — the backend serialises it as a string. */
  areaSqFt?: string | number | null;
  floorNumber?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  property?: FlatPropertyRef | null;
  rooms: FlatRoom[];
  images: FlatImage[];
  managerAssignments: FlatManagerAssignment[];
}

/**
 * `GET /owner/flats` answers with ownership records, not bare flats: the outer
 * row is the `PropertyOwnership` join and carries its own `status`. `flatId`
 * duplicates `flat.id`, and both are needed for display and for `PATCH`.
 */
export interface OwnerFlatRecord {
  id: string;
  flatId: string;
  status: ResourceStatus;
  flat: OwnerFlat;
}

/** `POST /properties/:propertyId/flats` echoes the new row with bare image URLs. */
export interface CreatedFlat {
  id: string;
  propertyId: string;
  flatNumber: string;
  status: ResourceStatus;
  areaSqFt?: string | null;
  floorNumber?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  images: string[];
}

/** `PATCH /flats/:flatId` answers with the row only — no relations. */
export interface UpdatedFlat {
  id: string;
  flatNumber: string;
  status: ResourceStatus;
  areaSqFt?: string | null;
  floorNumber?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
}

/**
 * Fields of the `data` field in the add-flat multipart body. Numeric boxes stay
 * text in the form and are converted here, so an empty input is omitted rather
 * than sent as `0`.
 */
export interface CreateFlatInput {
  flatNumber: string;
  floorNumber?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  description?: string;
}

/**
 * `PATCH` fields are all optional, so the form starts from the flat's current
 * values and submits every field it can.
 */
export type UpdateFlatInput = CreateFlatInput;

/** The image to show in a list: the primary one, else whatever uploaded first. */
export function primaryFlatImage(images: FlatImage[] | undefined) {
  if (!images || images.length === 0) return undefined;

  return images.find((image) => image.isPrimary) ?? images[0];
}
