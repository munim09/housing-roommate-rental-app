"use client";

import { useForm } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateProperty } from "@/hooks";
import {
  type CreatePropertyInput,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  type PropertyAreaOption,
} from "@/types";
import { type PropertyValues, propertySchema } from "@/validation";

export interface AddPropertyDialogProps {
  /**
   * Every city area flattened out, passed down from the Server Component so the
   * picker never fires a second request of its own.
   */
  areas: PropertyAreaOption[];
  /** A property cannot be placed without an area, so the trigger locks until one exists. */
  disabled?: boolean;
}

const EMPTY_VALUES: PropertyValues = {
  name: "",
  type: "MULTI_FLAT",
  address: "",
  areaId: "",
  postalCode: "",
  latitude: "",
  longitude: "",
  description: "",
};

/**
 * The form keeps `latitude`/`longitude` as text so an empty box stays empty,
 * and only numeric values are handed to the API — the columns are
 * `Decimal(10,7)` and `0,0` is a real (wrong) location.
 */
function toPayload(values: PropertyValues): CreatePropertyInput {
  const latitude = values.latitude?.trim() ?? "";
  const longitude = values.longitude?.trim() ?? "";

  return {
    name: values.name.trim(),
    type: values.type,
    address: values.address.trim(),
    areaId: values.areaId,
    ...(values.postalCode?.trim()
      ? { postalCode: values.postalCode.trim() }
      : {}),
    ...(values.description?.trim()
      ? { description: values.description.trim() }
      : {}),
    ...(latitude ? { latitude: Number(latitude) } : {}),
    ...(longitude ? { longitude: Number(longitude) } : {}),
  };
}

/** Areas grouped by city so the picker reads as a location, not a flat list. */
function groupByCity(areas: PropertyAreaOption[]) {
  const grouped = new Map<string, PropertyAreaOption[]>();

  for (const area of areas) {
    const existing = grouped.get(area.cityName);

    if (existing) {
      existing.push(area);
    } else {
      grouped.set(area.cityName, [area]);
    }
  }

  return [...grouped.entries()].map(([cityName, cityAreas]) => ({
    cityName,
    areas: cityAreas,
  }));
}

/** `POST /owner/properties` behind a modal — the only property write the UI needs. */
export function AddPropertyDialog({ areas, disabled }: AddPropertyDialogProps) {
  const router = useRouter();
  const createProperty = useCreateProperty();
  const [open, setOpen] = useState(false);

  // `Select` holds the area id (that is what the API wants in `areaId`), while
  // `items` is what makes the trigger read "Mirpur · Dhanmondi" instead of a
  // raw uuid — without it `<SelectValue>` stringifies the value.
  const areaLabels: Record<string, string> = Object.fromEntries(
    areas.map((area) => [area.id, `${area.areaName} · ${area.cityName}`]),
  );
  const cityGroups = groupByCity(areas);

  const form = useForm({
    defaultValues: { ...EMPTY_VALUES },
    validators: { onSubmit: propertySchema },
    onSubmit: ({ value }) => {
      createProperty.mutate(toPayload(value), {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Server Failure",
              description:
                res.message ?? "Something went wrong. Please try again",
              type: "error",
            });
            return;
          }

          toast.add({
            title: "Property added",
            description: `${res.data.name} is ready for its flats.`,
            type: "success",
          });
          form.reset({ ...EMPTY_VALUES });
          setOpen(false);
          // The dashboard reads stats and properties on the server, so a cache
          // invalidation alone would not repaint it.
          router.refresh();
        },
        onError: (err) => {
          toast.add({
            title: "Could not add the property",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button disabled={disabled} />}>
        <>
          <PlusIcon aria-hidden="true" />
          Add property
        </>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a property</DialogTitle>
          <DialogDescription>
            A property is the building you own. Flats are added inside it next.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="grid gap-5">
            <form.Field name="name">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor="property-name">Property name</FieldLabel>
                  <Input
                    id="property-name"
                    name="name"
                    autoComplete="off"
                    placeholder="Green View Residence"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
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
                  <FieldLabel htmlFor="property-type">Property type</FieldLabel>
                  <Select
                    items={PROPERTY_TYPE_LABELS}
                    value={field.state.value}
                    onValueChange={(next) => {
                      if (next) field.handleChange(next);
                    }}
                  >
                    <SelectTrigger
                      id="property-type"
                      className="w-full"
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {PROPERTY_TYPE_LABELS[type]}
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

            <form.Field name="areaId">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor="property-areaId">Area</FieldLabel>
                  <Select
                    items={areaLabels}
                    value={field.state.value || null}
                    onValueChange={(next) => {
                      if (next) field.handleChange(next);
                    }}
                  >
                    <SelectTrigger
                      id="property-areaId"
                      className="w-full"
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <SelectValue placeholder="Select an area" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityGroups.map((group) => (
                        <SelectGroup key={group.cityName}>
                          <SelectLabel>{group.cityName}</SelectLabel>
                          {group.areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.areaName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.isTouched && !field.state.meta.isValid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )}
            </form.Field>

            <form.Field name="address">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor="property-address">
                    Street address
                  </FieldLabel>
                  <Input
                    id="property-address"
                    name="address"
                    autoComplete="street-address"
                    placeholder="House 20, Road 7, Dhanmondi"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                  {field.state.meta.isTouched && !field.state.meta.isValid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )}
            </form.Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <form.Field name="postalCode">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor="property-postalCode">
                      Postal code
                    </FieldLabel>
                    <Input
                      id="property-postalCode"
                      name="postalCode"
                      autoComplete="postal-code"
                      placeholder="1205"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />
                    {field.state.meta.isTouched && !field.state.meta.isValid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )}
              </form.Field>

              <form.Field name="latitude">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor="property-latitude">
                      Latitude
                    </FieldLabel>
                    <Input
                      id="property-latitude"
                      name="latitude"
                      inputMode="decimal"
                      placeholder="23.7461"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />
                    {field.state.meta.isTouched && !field.state.meta.isValid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )}
              </form.Field>

              <form.Field name="longitude">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor="property-longitude">
                      Longitude
                    </FieldLabel>
                    <Input
                      id="property-longitude"
                      name="longitude"
                      inputMode="decimal"
                      placeholder="90.3742"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />
                    {field.state.meta.isTouched && !field.state.meta.isValid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name="description">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor="property-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    id="property-description"
                    name="description"
                    rows={3}
                    placeholder="Optional notes about the property"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                  {field.state.meta.isTouched && !field.state.meta.isValid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )}
            </form.Field>
          </div>

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={createProperty.isPending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createProperty.isPending}>
              {createProperty.isPending ? <Spinner /> : null}
              Add property
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
