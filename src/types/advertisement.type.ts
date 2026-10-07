export const RENTAL_TYPES = [
    "PRIMARY_ENTIRE_FLAT",
    "PRIMARY_ROOM",
    "SECONDARY_ROOM",
    "SECONDARY_ROOM_SHARING",
] as const;

export type RentalType = (typeof RENTAL_TYPES)[number];

export const RENTAL_TYPE_LABELS: Record<RentalType, string> = {
    PRIMARY_ENTIRE_FLAT: "Entire flat",
    PRIMARY_ROOM: "Single room",
    SECONDARY_ROOM: "Roommate · private room",
    SECONDARY_ROOM_SHARING: "Roommate · shared room",
};

/**
 * The four types a tenant actually picks in the UI. The backend has no "single
 * room" bucket: a room can be rented straight from an owner (`PRIMARY_ROOM`) or
 * sublet by a sitting tenant (`SECONDARY_ROOM`), so that filter fans out to two
 * requests. `undefined` in a mapping means "send no `rentalType` at all".
 */
export const LISTING_TYPES = [
    "ANY",
    "FLAT",
    "SINGLE_ROOM",
    // "SHARED_ROOM",
] as const;

export type ListingType = (typeof LISTING_TYPES)[number];

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
    ANY: "Any",
    FLAT: "Flat",
    SINGLE_ROOM: "Single room",
    //   SHARED_ROOM: "Shared room",
};

export const LISTING_TYPE_RENTAL_TYPES: Record<
    ListingType,
    readonly (RentalType | undefined)[]
> = {
    ANY: [undefined],
    FLAT: ["PRIMARY_ENTIRE_FLAT"],
    SINGLE_ROOM: ["PRIMARY_ROOM", "SECONDARY_ROOM"],
    SHARED_ROOM: ["SECONDARY_ROOM_SHARING"],
};

export type AdvertisementStatus =
    | "DRAFT"
    | "PUBLISHED"
    | "UNPUBLISHED"
    | "RENTED"
    | "FULL"
    | "EXPIRED"
    | "ARCHIVED";

/**
 * The only statuses a user may pick via `PATCH /advertisements/:id/status`.
 * `DRAFT` is listed because it is a real state (every new advertisement starts
 * there), but it is never a *choice* — a draft is left behind by publishing.
 */
export const ADVERTISEMENT_STATUSES: readonly AdvertisementStatus[] = [
    "DRAFT",
    "PUBLISHED",
    "UNPUBLISHED",
    "ARCHIVED",
] as const;

export const ADVERTISEMENT_STATUS_LABELS: Record<AdvertisementStatus, string> =
    {
        DRAFT: "Draft",
        PUBLISHED: "Published",
        UNPUBLISHED: "Unpublished",
        RENTED: "Rented",
        FULL: "Full",
        EXPIRED: "Expired",
        ARCHIVED: "Archived",
    };

/**
 * The `/available-advertisements` payload is not documented in req-res, so this
 * mirrors the advertisement columns accepted by the create/update endpoints
 * plus the `flat` / `room` / `property` / `area` relations the public route
 * resolves. Every relation is optional so a slimmer backend payload still types.
 */
export interface AdvertisementTarget {
    id: string;
    title?: string;
    flatNumber?: string | null;
    roomNumber?: string | null;
    name?: string | null;
    floorNumber?: string | number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    areaSqFt?: number | null;
    description?: string | null;
}

export interface AdvertisementProperty {
    id: string;
    name: string;
    address?: string | null;
    area?: {
        id: string;
        name: string;
        city?: { id: string; name: string };
    } | null;
}

export interface AvailableAdvertisement {
    id: string;
    title: string;
    description?: string | null;
    monthlyRent: number;
    availableFrom: string;
    availableTo: string;
    rentalType: RentalType;
    status: AdvertisementStatus;
    createdAt?: string;
    /**
     * Not documented for this route. Optional so the grid degrades to a
     * placeholder tile until the backend confirms the image field names.
     */
    images?: string[] | null;
    flat?: AdvertisementTarget | null;
    room?: AdvertisementTarget | null;
    property?: AdvertisementProperty | null;
    advertiser?: {
        id: string;
        name?: string | null;
    } | null;
}

/** A row of `flat.images` / `room.images` on the detail endpoint. */
export interface AdvertisementImage {
    id: string;
    imageUrl: string;
    isPrimary?: boolean | null;
    sortOrder?: number | null;
}

export interface AvailableAdvertisementRoom {
    id: string;
    flatId?: string | null;
    roomNumber?: string | null;
    name?: string | null;
    areaSqFt?: string | number | null;
    description?: string | null;
    status?: string | null;
    images?: AdvertisementImage[] | null;
}

export interface AvailableAdvertisementProperty extends AdvertisementProperty {
    type?: string | null;
    description?: string | null;
    postalCode?: string | null;
    latitude?: string | null;
    longitude?: string | null;
}

export interface AvailableAdvertisementFlat {
    id: string;
    propertyId?: string | null;
    flatNumber?: string | null;
    floorNumber?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    areaSqFt?: string | number | null;
    description?: string | null;
    status?: string | null;
    images?: AdvertisementImage[] | null;
    rooms?: AvailableAdvertisementRoom[] | null;
    property?: AvailableAdvertisementProperty | null;
}

export interface AvailableAdvertisementDetail {
    id: string;
    createdById?: string | null;
    flatId?: string | null;
    roomId?: string | null;
    rentalType: RentalType;
    title: string;
    description?: string | null;
    monthlyRent: string | number;
    availableFrom: string;
    availableTo: string;
    status: AdvertisementStatus | string;
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: {
        id: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
    } | null;
    images?: string[] | null;
    flat?: AvailableAdvertisementFlat | null;
    room?: AvailableAdvertisementRoom | null;
    property?: AvailableAdvertisementProperty | null;
}

export interface AvailableAdvertisementQuery {
    areaId: string;
    from: string;
    to: string;
    rentalType?: RentalType;
    page?: number;
    limit?: number;
}

/**
 * Everything a listing search carries. `type` is the tenant-facing filter and is
 * expanded into one or two `AvailableAdvertisementQuery` calls through
 * `LISTING_TYPE_RENTAL_TYPES`.
 */
export interface ListingSearchFilters {
    areaId: string;
    from: string;
    to: string;
    type: ListingType;
    page: number;
    limit: number;
}

export interface AdvertisementUser {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
}

export interface AdvertisementFlatRef {
    id: string;
    flatNumber?: string | null;
    floorNumber?: number | null;
    status?: string | null;
    property?: AdvertisementProperty | null;
}

export interface AdvertisementRoomRef {
    id: string;
    roomNumber?: string | null;
    name?: string | null;
    status?: string | null;
}

export interface Advertisement {
    id: string;
    createdById?: string | null;
    flatId?: string | null;
    roomId?: string | null;
    createdByTenantStayId?: string | null;
    rentalType: RentalType;
    title: string;
    description?: string | null;
    monthlyRent: string | number;
    availableFrom: string;
    availableTo: string;
    status: string;
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: AdvertisementUser | null;
    flat?: AdvertisementFlatRef | null;
    room?: AdvertisementRoomRef | null;
}
