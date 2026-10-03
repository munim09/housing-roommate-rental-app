"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useCreateFlat } from "@/hooks";
import { toFlatPayload } from "@/lib/to-flat-payload";
import type { OwnerProperty } from "@/types";
import { FlatFormFields } from "./flat-form-fields";
import { FlatImagePicker, type SelectedImage } from "./flat-image-picker";
import { EMPTY_FLAT_VALUES, useFlatForm } from "./use-flat-form";

export interface AddFlatDialogProps {
  /** Every property the owner owns, so the flat can be placed inside one. */
  properties: OwnerProperty[];
}

/** Only properties that can hold flats are worth offering as a parent. */
function isFlatContainer(property: OwnerProperty) {
  return property.type === "MULTI_FLAT" || property.type === "SINGLE_FLAT";
}

/**
 * `POST /owner/properties/:propertyId/flats` behind a modal.
 *
 * The request is `multipart/form-data`, not JSON: the six flat columns travel as
 * a JSON string in a part named `data` and the photos travel as separate
 * `images` parts. `createFlat` builds that body, so nothing here touches
 * `FormData` directly.
 */
export function AddFlatDialog({ properties }: AddFlatDialogProps) {
  const router = useRouter();
  const createFlat = useCreateFlat();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const options = properties.filter(isFlatContainer);
  const propertyLabels = Object.fromEntries(
    options.map((property) => [property.id, property.name]),
  );

  const form = useFlatForm({
    defaultValues: { ...EMPTY_FLAT_VALUES },
    onSubmit: (values) => {
      setDuplicateError(null);
      createFlat.mutate(
        {
          propertyId: values.propertyId,
          fields: toFlatPayload(values),
          // The picker keeps each file beside its preview URL; the request only
          // wants the files.
          images: images.map((image) => image.file),
        },
        {
          onSuccess: (res) => {
            if (!res.success) {
              // `flatNumber` is unique per property, and the backend answers that
              // collision with a Prisma error rather than a field error, so it
              // is surfaced against the input that caused it.
              if (/duplicate/i.test(res.message)) {
                setDuplicateError(
                  `${values.flatNumber.trim()} already exists in this property.`,
                );

                return;
              }

              toast.add({
                title: "Server Failure",
                description:
                  res.message ?? "Something went wrong. Please try again",
                type: "error",
              });

              return;
            }

            toast.add({
              title: "Flat added",
              description: `Flat ${res.data.flatNumber} is ready for rooms.`,
              type: "success",
            });
            form.reset({ ...EMPTY_FLAT_VALUES });
            setImages([]);
            setOpen(false);
            // The list and the room sheet are Server Component reads, so a cache
            // invalidation alone would not repaint them.
            router.refresh();
          },
          onError: (err) => {
            toast.add({
              title: "Could not add the flat",
              description:
                err.message || "Something went wrong. Please try again",
              type: "error",
            });
          },
        },
      );
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDuplicateError(null);
      }}
    >
      <DialogTrigger
        render={<Button disabled={options.length === 0} />}
        title={
          options.length === 0
            ? "Add a property first — a flat has to live inside one"
            : undefined
        }
      >
        <PlusIcon aria-hidden="true" />
        Add flat
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a flat</DialogTitle>
          <DialogDescription>
            A flat goes inside a property. Only the flat number is required —
            the rest can be filled in later.
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
            <form.Field name="propertyId">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor="flat-propertyId">Property</FieldLabel>
                    {/* `items` is what makes the trigger read "Green View
                        Residency" instead of a raw uuid. */}
                    <Select
                      items={propertyLabels}
                      value={field.state.value || null}
                      onValueChange={(next) => {
                        if (next) field.handleChange(next);
                      }}
                    >
                      <SelectTrigger
                        id="flat-propertyId"
                        className="w-full"
                        aria-invalid={invalid}
                      >
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {invalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <FlatFormFields
              form={form}
              idPrefix="add-flat"
              disabled={createFlat.isPending}
            />

            {duplicateError ? (
              <Field data-invalid>
                <FieldError errors={[{ message: duplicateError }]} />
              </Field>
            ) : null}

            <FlatImagePicker
              images={images}
              onChange={setImages}
              disabled={createFlat.isPending}
            />
          </div>

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={createFlat.isPending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createFlat.isPending}>
              {createFlat.isPending ? <Spinner /> : null}
              Add flat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
