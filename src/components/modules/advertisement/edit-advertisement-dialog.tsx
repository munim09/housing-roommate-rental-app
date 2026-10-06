"use client";

import { PencilIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useUpdateAdvertisement } from "@/hooks";
import type { Advertisement } from "@/types";
import { toDateInputValue } from "@/validation";
import { advertisementTargetLabel } from "./advertisement-target";
import {
  EMPTY_ADVERTISEMENT_VALUES,
  useAdvertisementForm,
} from "./use-advertisement-form";

export interface EditAdvertisementDialogProps {
  advertisement: Advertisement;
}

/**
 * `PATCH /advertisements/:id` behind a modal. Every editable column is
 * prefilled from the advertisement, and only the five shared fields travel back.
 */
export function EditAdvertisementDialog({
  advertisement,
}: EditAdvertisementDialogProps) {
  const updateAd = useUpdateAdvertisement();
  const [open, setOpen] = useState(false);

  const form = useAdvertisementForm({
    defaultValues: {
      title: advertisement.title,
      description: advertisement.description ?? "",
      monthlyRent: String(advertisement.monthlyRent),
      availableFrom: toDateInputValue(advertisement.availableFrom),
      availableTo: toDateInputValue(advertisement.availableTo),
    },
    onSubmit: (values) => {
      updateAd.mutate(
        {
          advertisementId: advertisement.id,
          body: {
            title: values.title,
            description: values.description || undefined,
            monthlyRent: Number(values.monthlyRent),
            availableFrom: values.availableFrom,
            availableTo: values.availableTo,
          },
        },
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
              title: "Advertisement updated",
              description: res.message ?? "Your changes are saved.",
              type: "success",
            });
            setOpen(false);
          },
          onError: (error: Error) => {
            toast.add({
              title: "Could not update the advertisement",
              description:
                error.message || "Something went wrong. Please try again",
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
        if (!next) form.reset();
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilIcon aria-hidden="true" />
        Edit
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit advertisement</DialogTitle>
          <DialogDescription>
            Editing{" "}
            <span className="text-foreground">
              {advertisementTargetLabel(advertisement)}
            </span>{" "}
            — only the title, description, rent and availability window can
            change here.
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
            <form.Field name="title">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor="edit-ad-title">Title</FieldLabel>
                    <Input
                      id="edit-ad-title"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="2BHK flat near Dhanmondi"
                      aria-invalid={invalid}
                    />
                    {invalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="edit-ad-description">
                    Description{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Textarea
                    id="edit-ad-description"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="A nice flat with gas and water"
                    rows={3}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="monthlyRent">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor="edit-ad-monthlyRent">
                      Monthly rent
                    </FieldLabel>
                    <Input
                      id="edit-ad-monthlyRent"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={field.state.value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                    />
                    {invalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field name="availableFrom">
                {(field) => {
                  const invalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor="edit-ad-availableFrom">
                        Available from
                      </FieldLabel>
                      <Input
                        id="edit-ad-availableFrom"
                        type="date"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                      />
                      {invalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="availableTo">
                {(field) => {
                  const invalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor="edit-ad-availableTo">
                        Available to
                      </FieldLabel>
                      <Input
                        id="edit-ad-availableTo"
                        type="date"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={invalid}
                      />
                      {invalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </div>

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={updateAd.isPending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={updateAd.isPending}>
              {updateAd.isPending ? <Spinner /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
