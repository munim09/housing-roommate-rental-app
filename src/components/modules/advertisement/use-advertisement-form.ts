"use client";

import { useForm } from "@tanstack/react-form";
import type { AdvertisementFormValues } from "@/validation";
import { advertisementFormSchema } from "@/validation";

export const EMPTY_ADVERTISEMENT_VALUES: AdvertisementFormValues = {
  title: "",
  description: "",
  monthlyRent: "",
  availableFrom: "",
  availableTo: "",
};

/**
 * One form, one schema for both "create" (`POST /advertisements/flats|rooms`)
 * and "update" (`PATCH /advertisements/:id`) — the two endpoints share the same
 * five columns, so add and edit cannot drift into two validators.
 */
export function useAdvertisementForm(options: {
  defaultValues: AdvertisementFormValues;
  onSubmit: (values: AdvertisementFormValues) => void;
}) {
  return useForm({
    defaultValues: options.defaultValues,
    validators: { onSubmit: advertisementFormSchema },
    onSubmit: async ({ value }) => {
      options.onSubmit(value);
    },
  });
}
