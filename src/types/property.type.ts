/** Mirrors the backend `PropertyType` enum — anything else is rejected with 400. */
export const PROPERTY_TYPES = ["SINGLE_FLAT", "MULTI_FLAT"] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  SINGLE_FLAT: "Single flat",
  MULTI_FLAT: "Multiple flats",
};

/**
 * `Property`, `Flat` and `Room` share one lifecycle enum in the schema, so one
 * union covers all three instead of repeating identical string unions.
 */
export const RESOURCE_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

/** Rooms nest inside flats inside properties on `GET /owner/properties`. */
export interface OwnerRoom {
  id: string;
  roomNumber: string;
  name?: string | null;
  status: ResourceStatus;
}

export interface OwnerFlat {
  id: string;
  flatNumber: string;
  floorNumber?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  status: ResourceStatus;
  rooms: OwnerRoom[];
}

export interface OwnerPropertyArea {
  id: string;
  cityId: string;
  name: string;
}

/**
 * Flattened city → area pair for the "add property" picker. `GET /cities`
 * returns areas nested under each city, but a select needs one flat option list
 * that can still say which city an area belongs to.
 */
export interface PropertyAreaOption {
  id: string;
  areaName: string;
  cityName: string;
}

/** Builds the picker options from the nested `GET /cities` payload. */
export function toPropertyAreaOptions(
  cities: { name: string; areas?: { id: string; name: string }[] }[],
): PropertyAreaOption[] {
  return cities.flatMap((city) =>
    (city.areas ?? []).map((area) => ({
      id: area.id,
      areaName: area.name,
      cityName: city.name,
    })),
  );
}

export interface OwnerProperty {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  status: ResourceStatus;
  createdAt: string;
  description?: string | null;
  postalCode?: string | null;
  area?: OwnerPropertyArea | null;
  /** Empty for a property the owner has not broken into flats yet. */
  flats: OwnerFlat[];
}

/** Flat totals are needed for the header stats, so they are derived here. */
export interface OwnerPropertyTotals {
  properties: number;
  flats: number;
  rooms: number;
}

/** Counts every flat and room across the property list in one pass. */
export function sumPropertyCapacity(
  properties: OwnerProperty[],
): OwnerPropertyTotals {
  return properties.reduce<OwnerPropertyTotals>(
    (totals, property) => {
      const flats = property.flats ?? [];

      return {
        properties: totals.properties + 1,
        flats: totals.flats + flats.length,
        rooms:
          totals.rooms +
          flats.reduce(
            (roomTotal, flat) => roomTotal + (flat.rooms?.length ?? 0),
            0,
          ),
      };
    },
    { properties: 0, flats: 0, rooms: 0 },
  );
}

/** Response of `GET /owner/dashboard`. */
export interface OwnerDashboardStats {
  properties: number;
  ownedFlats: number;
  confirmedStays: number;
  activeStays: number;
  totalCollection: number;
  rentCollectionThisMonth: number;
  utilityCollectionThisMonth: number;
}

/**
 * Payload for `POST /owner/properties`. `latitude`/`longitude` are
 * `Decimal(10,7)` columns, which the backend may echo back as either a number
 * or a string, so the form only ever sends real numbers.
 */
export interface CreatePropertyInput {
  name: string;
  type: PropertyType;
  address: string;
  areaId: string;
  description?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}
