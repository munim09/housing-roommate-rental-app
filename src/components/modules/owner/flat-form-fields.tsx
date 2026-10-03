"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FlatFormApi } from "./use-flat-form";

export interface FlatFormFieldsProps {
  form: FlatFormApi;
  /**
   * Namespace for the generated `id`/`htmlFor` pairs. The add and edit dialogs
   * are never open at the same time, but a stable prefix keeps the ids unique
   * in the DOM and stops a browser from restoring one dialog's values into the
   * other.
   */
  idPrefix: string;
  /** Renders the shared fields as read-only, for a flat already in place. */
  disabled?: boolean;
}

/** Kept in step with `FieldError` so the shared helper cannot drift from it. */
type FieldErrorList = Parameters<typeof FieldError>[0]["errors"];

/** Renders the errors of a touched, invalid field, or nothing. */
function FieldErrorHint({
  touched,
  valid,
  errors,
}: {
  touched: boolean;
  valid: boolean;
  errors: FieldErrorList;
}) {
  if (!touched || valid) return null;

  return <FieldError errors={errors} />;
}

/**
 * The six flat columns that both the add and the edit dialog write.
 *
 * Extracted because `POST /properties/:propertyId/flats` and
 * `PATCH /flats/:flatId` accept the same set — duplicating six blocks across two
 * dialogs is exactly the copy-paste that lets the two drift apart. The property
 * picker is *not* here: it exists only when creating, because a flat cannot be
 * moved between properties afterwards.
 */
export function FlatFormFields({
  form,
  idPrefix,
  disabled,
}: FlatFormFieldsProps) {
  return (
    <div className="grid gap-5">
      <form.Field name="flatNumber">
        {(field) => {
          const invalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={`${idPrefix}-flatNumber`}>
                Flat number
              </FieldLabel>
              <Input
                id={`${idPrefix}-flatNumber`}
                name="flatNumber"
                autoComplete="off"
                placeholder="C1"
                disabled={disabled}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={invalid}
              />
              <FieldErrorHint
                touched={field.state.meta.isTouched}
                valid={field.state.meta.isValid}
                errors={field.state.meta.errors}
              />
            </Field>
          );
        }}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-4">
        <NumericField
          form={form}
          name="floorNumber"
          idPrefix={idPrefix}
          label="Floor"
          placeholder="3"
          disabled={disabled}
        />
        <NumericField
          form={form}
          name="bedrooms"
          idPrefix={idPrefix}
          label="Bedrooms"
          placeholder="2"
          disabled={disabled}
        />
        <NumericField
          form={form}
          name="bathrooms"
          idPrefix={idPrefix}
          label="Bathrooms"
          placeholder="1"
          disabled={disabled}
        />
        <NumericField
          form={form}
          name="areaSqFt"
          idPrefix={idPrefix}
          label="Area"
          placeholder="1200"
          suffix="sq ft"
          disabled={disabled}
        />
      </div>

      <form.Field name="description">
        {(field) => {
          const invalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={`${idPrefix}-description`}>
                Description
              </FieldLabel>
              <Textarea
                id={`${idPrefix}-description`}
                name="description"
                rows={3}
                placeholder="Optional notes about the flat"
                disabled={disabled}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={invalid}
              />
              <FieldErrorHint
                touched={field.state.meta.isTouched}
                valid={field.state.meta.isValid}
                errors={field.state.meta.errors}
              />
            </Field>
          );
        }}
      </form.Field>
    </div>
  );
}

type NumericFieldName = "floorNumber" | "bedrooms" | "bathrooms" | "areaSqFt";

/**
 * The four numeric columns. `inputMode="numeric"` gives a numeric keypad on
 * mobile while keeping the value a string, which is what lets an empty box stay
 * empty instead of becoming `0`.
 */
function NumericField({
  form,
  name,
  idPrefix,
  label,
  placeholder,
  suffix,
  disabled,
}: {
  form: FlatFormApi;
  name: NumericFieldName;
  idPrefix: string;
  label: string;
  placeholder: string;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <form.Field name={name}>
      {(field) => {
        const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
        const id = `${idPrefix}-${name}`;

        return (
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor={id}>
              {label}
              {suffix ? (
                <span className="text-muted-foreground"> ({suffix})</span>
              ) : null}
            </FieldLabel>
            <Input
              id={id}
              name={name}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={placeholder}
              disabled={disabled}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={invalid}
            />
            <FieldErrorHint
              touched={field.state.meta.isTouched}
              valid={field.state.meta.isValid}
              errors={field.state.meta.errors}
            />
          </Field>
        );
      }}
    </form.Field>
  );
}
