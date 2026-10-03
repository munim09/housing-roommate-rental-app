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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useCreateCity } from "@/hooks";
import { type CityValues, citySchema } from "@/validation";

/** `POST /admin/cities` behind a modal — the only city write the UI needs. */
export function AddCityDialog() {
  const router = useRouter();
  const createCity = useCreateCity();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { name: "" } satisfies CityValues,
    validators: { onSubmit: citySchema },
    onSubmit: ({ value }) => {
      createCity.mutate(value, {
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
            title: "City added",
            description: `${res.data.name} is now available for listings.`,
            type: "success",
          });
          form.reset();
          setOpen(false);
          router.refresh();
        },
        onError: (err) => {
          toast.add({
            title: "Could not add the city",
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
      <DialogTrigger render={<Button />}>
        <PlusIcon aria-hidden="true" />
        Add city
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a city</DialogTitle>
          <DialogDescription>
            Cities group the areas owners list their properties in.
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
          <form.Field name="name">
            {(field) => (
              <Field
                data-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              >
                <FieldLabel htmlFor="city-name">City name</FieldLabel>
                <Input
                  id="city-name"
                  name="name"
                  autoComplete="off"
                  placeholder="Sylhet"
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

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={createCity.isPending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createCity.isPending}>
              {createCity.isPending ? <Spinner /> : null}
              Add city
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
