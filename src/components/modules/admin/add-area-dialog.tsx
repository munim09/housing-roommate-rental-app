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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useCreateArea } from "@/hooks";
import type { City } from "@/types";
import { type AreaValues, areaSchema } from "@/validation";

export interface AddAreaDialogProps {
  /**
   * Every city, passed down from the Server Component so the picker never
   * fires a second request on its own.
   */
  cities: City[];
  /** Pre-selected when the areas table is already filtered by city. */
  defaultCityId?: string;
  /** An area is meaningless without a city, so the trigger locks until one exists. */
  disabled?: boolean;
}

/** `POST /admin/areas` behind a modal — the only area write the UI needs. */
export function AddAreaDialog({
  cities,
  defaultCityId,
  disabled,
}: AddAreaDialogProps) {
  const router = useRouter();
  const createArea = useCreateArea();
  const [open, setOpen] = useState(false);

  // `Select` keeps `value` as the city id (that is what the API expects in
  // `cityId`), but `items` is what makes the trigger render the city name
  // instead of the raw uuid. Without it `<SelectValue>` falls back to
  // stringifying the value.
  const cityLabels: Record<string, string> = Object.fromEntries(
    cities.map((city) => [city.id, city.name]),
  );

  const form = useForm({
    defaultValues: {
      cityId: defaultCityId ?? "",
      name: "",
    } satisfies AreaValues,
    validators: { onSubmit: areaSchema },
    onSubmit: ({ value }) => {
      createArea.mutate(value, {
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
            title: "Area added",
            description: `${res.data.name} now sits under ${res.data.city?.name ?? "its city"}.`,
            type: "success",
          });
          form.reset({ cityId: value.cityId, name: "" });
          setOpen(false);
          router.refresh();
        },
        onError: (err) => {
          toast.add({
            title: "Could not add the area",
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
        <PlusIcon aria-hidden="true" />
        Add area
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an area</DialogTitle>
          <DialogDescription>
            Areas are the neighbourhoods owners place a property in.
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
            <form.Field name="cityId">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor="area-cityId">City</FieldLabel>
                  <Select
                    items={cityLabels}
                    value={field.state.value || null}
                    onValueChange={(next) => {
                      if (next) field.handleChange(next);
                    }}
                  >
                    <SelectTrigger
                      id="area-cityId"
                      className="w-full"
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
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

            <form.Field name="name">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor="area-name">Area name</FieldLabel>
                  <Input
                    id="area-name"
                    name="name"
                    autoComplete="off"
                    placeholder="Monihar"
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
              disabled={createArea.isPending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createArea.isPending}>
              {createArea.isPending ? <Spinner /> : null}
              Add area
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
