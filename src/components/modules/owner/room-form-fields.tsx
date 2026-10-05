"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RoomFormApi } from "./use-room-form";

export interface RoomFormFieldsProps {
  form: RoomFormApi;
  /**
   * Namespace for the generated `id`/`htmlFor` pairs. The add and edit dialogs
   * are never open at the same time, but a stable prefix keeps the ids unique in
   * the DOM and stops a browser from restoring one dialog's values into the other.
   */
  idPrefix: string;
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
 * The four room columns that both the add and the update dialog write.
 *
 * Extracted because `POST /owner/flats/:flatId/rooms` and
 * `PATCH /owner/rooms/:roomId` accept the same set. `areaSqFt` gets its own
 * column because it is the only numeric one — `inputMode="numeric"` gives a
 * numeric keypad on mobile while keeping the value a string, which is what lets
 * an empty box stay empty instead of becoming `0`.
 */
export function RoomFormFields({
  form,
  idPrefix,
  disabled,
}: RoomFormFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="roomNumber">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={`${idPrefix}-roomNumber`}>
                  Room number
                </FieldLabel>
                <Input
                  id={`${idPrefix}-roomNumber`}
                  name="roomNumber"
                  autoComplete="off"
                  placeholder="B1-04"
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

        <form.Field name="name">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={`${idPrefix}-name`}>Room name</FieldLabel>
                <Input
                  id={`${idPrefix}-name`}
                  name="name"
                  autoComplete="off"
                  placeholder="Master Bedroom"
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

      <form.Field name="areaSqFt">
        {(field) => {
          const invalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          const id = `${idPrefix}-areaSqFt`;

          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={id}>
                Area <span className="text-muted-foreground">(sq ft)</span>
              </FieldLabel>
              <Input
                id={id}
                name="areaSqFt"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="200"
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
                placeholder="Optional notes about the room"
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
