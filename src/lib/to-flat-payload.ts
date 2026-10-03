import type { CreateFlatInput } from "@/types";

export interface FlatFieldValues {
  flatNumber: string;
  floorNumber?: string;
  bedrooms?: string;
  bathrooms?: string;
  areaSqFt?: string;
  description?: string;
}

/**
 * Turns the flat form's text values into the `data` payload.
 *
 * The backend columns are `floorNumber Int?`, `bedrooms Int?`, `bathrooms Int?`
 * and `areaSqFt Decimal?`, so a blank box must be *omitted* rather than sent as
 * `0` — `0` is a real (wrong) value and the update route would overwrite a
 * stored number with it. `flatNumber` is the only field guaranteed to be present,
 * because Zod rejects it empty before submit.
 */
export function toFlatPayload(values: FlatFieldValues): CreateFlatInput {
  const payload: CreateFlatInput = { flatNumber: values.flatNumber.trim() };

  const floorNumber = parseOptionalNumber(values.floorNumber);
  const bedrooms = parseOptionalNumber(values.bedrooms);
  const bathrooms = parseOptionalNumber(values.bathrooms);
  const areaSqFt = parseOptionalNumber(values.areaSqFt);

  if (floorNumber !== undefined) payload.floorNumber = floorNumber;
  if (bedrooms !== undefined) payload.bedrooms = bedrooms;
  if (bathrooms !== undefined) payload.bathrooms = bathrooms;
  if (areaSqFt !== undefined) payload.areaSqFt = areaSqFt;

  if (values.description?.trim()) {
    payload.description = values.description.trim();
  }

  return payload;
}

/** `undefined` for an empty box, the number otherwise. Zod already vetted it. */
function parseOptionalNumber(raw?: string): number | undefined {
  const value = raw?.trim();

  return value ? Number(value) : undefined;
}
