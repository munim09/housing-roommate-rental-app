"use client";

import { PencilIcon } from "lucide-react";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUpdateFlat } from "@/hooks";
import { toFlatPayload } from "@/lib/to-flat-payload";
import type { OwnerFlat } from "@/types";
import type { FlatValues } from "@/validation";
import { FlatFormFields } from "./flat-form-fields";
import { useFlatForm } from "./use-flat-form";

export interface EditFlatDialogProps {
  flat: OwnerFlat;
  /** Rendered as the row's action button when the dialog has no trigger of its own. */
  trigger?: React.ReactNode;
}

/**
 * Pre-fills the form from the flat.
 *
 * Every numeric column arrives as a `Decimal`/`Int` — sometimes a string, since
 * `areaSqFt` is serialised as one — so each is stringified for the text input
 * and a missing value becomes an empty box rather than `"null"`. `propertyId` is
 * carried through untouched: the dialog shows it read-only and the payload
 * builder drops it, because a flat cannot be moved between properties.
 */
function toFlatFormValues(flat: OwnerFlat): FlatValues {
  return {
    propertyId: flat.property?.id ?? "",
    flatNumber: flat.flatNumber,
    floorNumber: flat.floorNumber == null ? "" : String(flat.floorNumber),
    bedrooms: flat.bedrooms == null ? "" : String(flat.bedrooms),
    bathrooms: flat.bathrooms == null ? "" : String(flat.bathrooms),
    areaSqFt:
      flat.areaSqFt == null || flat.areaSqFt === ""
        ? ""
        : String(flat.areaSqFt),
    description: flat.description ?? "",
  };
}

/**
 * `PATCH /owner/flats/:flatId` behind a modal. This is plain JSON, unlike the
 * add route, and it sends every editable field rather than only the changed
 * ones — a partial diff would need to track which inputs were touched.
 */
export function EditFlatDialog({ flat, trigger }: EditFlatDialogProps) {
  const router = useRouter();
  const updateFlat = useUpdateFlat();
  const [open, setOpen] = useState(false);

  const form = useFlatForm({
    defaultValues: toFlatFormValues(flat),
    onSubmit: (values) => {
      updateFlat.mutate(
        { flatId: flat.id, payload: toFlatPayload(values) },
        {
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
              title: "Flat updated",
              description: `Flat ${res.data.flatNumber} has been saved.`,
              type: "success",
            });
            setOpen(false);
            // The row is a Server Component read, so the cache invalidation from
            // the mutation is not enough on its own.
            router.refresh();
          },
          onError: (err) => {
            toast.add({
              title: "Could not update the flat",
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        {trigger ?? <PencilIcon aria-hidden="true" />}
        <span className="sr-only">Edit flat {flat.flatNumber}</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit flat {flat.flatNumber}</DialogTitle>
          <DialogDescription>
            Changes save straight away and apply to the live listing.
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
            {/* A flat cannot change property, so the value is shown read-only.
                It stays in form state because the add dialog validates the same
                schema, and `toFlatPayload` drops it from the request. */}
            <Field>
              <FieldLabel htmlFor="edit-flat-property">Property</FieldLabel>
              <Input
                id="edit-flat-property"
                value={flat.property?.name ?? "Unknown property"}
                disabled
                readOnly
              />
            </Field>

            <FlatFormFields
              form={form}
              idPrefix="edit-flat"
              disabled={updateFlat.isPending}
            />
          </div>

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={updateFlat.isPending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={updateFlat.isPending}>
              {updateFlat.isPending ? <Spinner /> : null}
              <PencilIcon aria-hidden="true" />
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
