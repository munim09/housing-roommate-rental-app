"use client";

import { useForm } from "@tanstack/react-form";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AreaCombobox } from "@/components/form/area-combobox";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListingType } from "@/types";
import type { ListingSearchValues } from "@/validation";
import { LISTING_TYPE_OPTIONS, listingSearchSchema } from "@/validation";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return date.toISOString().slice(0, 10);
}

function isValidDate(value: string | undefined) {
  return (
    Boolean(value) &&
    DATE_PATTERN.test(value as string) &&
    !Number.isNaN(Date.parse(value as string))
  );
}

function orDefault(value: string | undefined, fallback: string) {
  return isValidDate(value) ? (value as string) : fallback;
}

export interface ListingSearchFormProps {
  /** Hydrated from the URL so the hero form reflects an in-progress search. */
  defaultValues?: Partial<ListingSearchValues> & { areaLabel?: string };
}

export function ListingSearchForm({ defaultValues }: ListingSearchFormProps) {
  const router = useRouter();

  // `areaLabel` is display-only, so it stays out of the validated form payload.
  const [areaLabel, setAreaLabel] = useState(defaultValues?.areaLabel ?? "");
  const areaLabelRef = useRef(areaLabel);
  areaLabelRef.current = areaLabel;

  const form = useForm({
    defaultValues: {
      areaId: defaultValues?.areaId ?? "",
      from: orDefault(defaultValues?.from, isoDate()),
      to: orDefault(defaultValues?.to, isoDate(30)),
      type: defaultValues?.type ?? "ANY",
    } satisfies ListingSearchValues,
    validators: {
      onSubmit: listingSearchSchema,
    },
    onSubmit: ({ value }) => {
      const params = new URLSearchParams({
        areaId: value.areaId,
        from: value.from,
        to: value.to,
      });

      // `area` is display-only; `areaId` is what the backend filters on.
      if (areaLabelRef.current) params.set("area", areaLabelRef.current);
      // "Any" is the absence of a filter, so it stays out of the URL.
      if (value.type !== "ANY") params.set("type", value.type);

      router.push(`/listings?${params.toString()}`);
    },
  });

  return (
    <form
      className="rounded-2xl border bg-card p-5 text-card-foreground shadow-sm"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))_minmax(0,1.2fr)_auto] lg:items-start">
        <form.Field name="areaId">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="areaId">
                Area
                <span className="text-muted-foreground">(required)</span>
              </FieldLabel>
              <AreaCombobox
                id="areaId"
                name="areaId"
                value={field.state.value}
                label={areaLabel}
                onChange={(nextAreaId, nextLabel) => {
                  field.handleChange(nextAreaId);
                  setAreaLabel(nextLabel);
                }}
                onBlur={field.handleBlur}
                invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              />
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <form.Field name="from">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="from">Move-in</FieldLabel>
              <Input
                id="from"
                name="from"
                type="date"
                value={field.state.value}
                min={isoDate()}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                className="h-11"
              />
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <form.Field name="to">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="to">Move-out</FieldLabel>
              <Input
                id="to"
                name="to"
                type="date"
                value={field.state.value}
                min={form.state.values.from}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                className="h-11"
              />
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="type">
                Type <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Select<ListingType>
                value={field.state.value}
                onValueChange={(next) => {
                  if (next) field.handleChange(next);
                }}
              >
                <SelectTrigger
                  id="type"
                  className="h-11 w-full"
                  aria-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <Button type="submit" size="lg" className="h-11 lg:mt-7">
          <SearchIcon aria-hidden="true" />
          Search
        </Button>
      </div>
    </form>
  );
}
