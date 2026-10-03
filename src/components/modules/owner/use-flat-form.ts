"use client";

import { useForm } from "@tanstack/react-form";
import { type FlatValues, flatSchema } from "@/validation";

export const EMPTY_FLAT_VALUES: FlatValues = {
  propertyId: "",
  flatNumber: "",
  floorNumber: "",
  bedrooms: "",
  bathrooms: "",
  areaSqFt: "",
  description: "",
};

/**
 * One form, one schema, used by both the add and the edit dialog.
 *
 * `PATCH /flats/:flatId` takes the same columns as the add payload minus
 * `propertyId`, so the edit dialog keeps `propertyId` in form state (shown
 * read-only, since a flat cannot be moved between properties) and simply drops
 * it when it builds the request. That keeps "add" and "edit" from drifting into
 * two subtly different validators.
 *
 * Numeric columns stay text so an empty box stays empty; `toFlatPayload` turns
 * them into numbers and omits anything left blank.
 */
export function useFlatForm(options: {
  defaultValues: FlatValues;
  onSubmit: (values: FlatValues) => void;
}) {
  return useForm({
    defaultValues: options.defaultValues,
    validators: { onSubmit: flatSchema },
    onSubmit: async ({ value }) => {
      options.onSubmit(value);
    },
  });
}

export type FlatFormApi = ReturnType<typeof useFlatForm>;
