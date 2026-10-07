"use client";

import { useForm } from "@tanstack/react-form";
import { DropletsIcon, PencilIcon } from "lucide-react";
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
import {
  useCreateUtilityInvoice,
  useUpdateUtilityInvoice,
} from "@/hooks/invoice.hook";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BillStatus, Invoice } from "@/types";
import {
  EMPTY_UTILITY_BILL_VALUES,
  toDateInputValue,
  toPeriodEnd,
  toPeriodStart,
  type UtilityBillValues,
  utilityBillSchema,
} from "@/validation";

const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export interface CreateUtilityBillButtonProps {
  /** The stay the bill is raised against — only offered once it is CONFIRMED. */
  stayId: string;
}

export interface EditUtilityBillButtonProps {
  invoice: Invoice;
}

interface UtilityBillDialogProps {
  invoice?: Invoice;
  stayId?: string;
}

/**
 * One dialog behind two triggers: creating a utility bill against a stay, or
 * correcting one that has not been paid yet. Both write through the manager
 * utility-invoice endpoints (`req-res/api.txt`) and refetch every invoice list
 * when they succeed, so the drawer repaints with the saved values.
 */
function UtilityBillDialog({ invoice, stayId }: UtilityBillDialogProps) {
  const isEdit = Boolean(invoice);
  const create = useCreateUtilityInvoice();
  const update = useUpdateUtilityInvoice();
  const [open, setOpen] = useState(false);

  const pending = create.isPending || update.isPending;

  const defaultValues: UtilityBillValues = invoice
    ? {
        amount: String(Number(invoice.amount)),
        billingPeriodStart: toDateInputValue(invoice.billingPeriodStart),
        billingPeriodEnd: toDateInputValue(invoice.billingPeriodEnd),
        description: invoice.description ?? "",
        status: invoice.status,
      }
    : EMPTY_UTILITY_BILL_VALUES;

  const form = useForm({
    defaultValues,
    validators: { onSubmit: utilityBillSchema },
    onSubmit: ({ value }) => {
      const description = value.description.trim();
      const shared = {
        amount: Number(value.amount),
        billingPeriodStart: toPeriodStart(value.billingPeriodStart),
        billingPeriodEnd: toPeriodEnd(value.billingPeriodEnd),
        ...(description ? { description } : {}),
      };

      if (invoice) {
        update.mutate(
          { invoiceId: invoice.id, body: { ...shared, status: value.status } },
          {
            onSuccess: (response) => {
              if (!response.success) {
                toast.add({
                  title: "Could not update the utility bill",
                  description:
                    response.message ?? "The backend rejected the change.",
                  type: "error",
                });
                return;
              }

              toast.add({
                title: "Utility bill updated",
                description: `${formatCurrency(Number(response.data?.amount ?? shared.amount))} · ${formatDate(shared.billingPeriodStart)} → ${formatDate(shared.billingPeriodEnd)}.`,
                type: "success",
              });
              setOpen(false);
            },
            onError: (error) => {
              toast.add({
                title: "Could not update the utility bill",
                description: error.message || "Something went wrong.",
                type: "error",
              });
            },
          },
        );
        return;
      }

      if (!stayId) return;

      create.mutate(
        { stayId, ...shared },
        {
          onSuccess: (response) => {
            if (!response.success) {
              toast.add({
                title: "Could not create the utility bill",
                description:
                  response.message ?? "The backend rejected the bill.",
                type: "error",
              });
              return;
            }

            toast.add({
              title: "Utility bill created",
              description: `${formatCurrency(Number(response.data?.amount ?? shared.amount))} · ${formatDate(shared.billingPeriodStart)} → ${formatDate(shared.billingPeriodEnd)}.`,
              type: "success",
            });
            form.reset(EMPTY_UTILITY_BILL_VALUES);
            setOpen(false);
          },
          onError: (error) => {
            toast.add({
              title: "Could not create the utility bill",
              description: error.message || "Something went wrong.",
              type: "error",
            });
          },
        },
      );
    },
  });

  if (!isEdit && !stayId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button type="button" size="xs" variant="ghost" />
          ) : (
            <Button type="button" size="sm" variant="outline" />
          )
        }
      >
        {isEdit ? (
          <>
            <PencilIcon aria-hidden="true" />
            Edit
          </>
        ) : (
          <>
            <DropletsIcon aria-hidden="true" />
            Create utility bill
          </>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit utility bill" : "Create utility bill"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Only unpaid bills can be changed. A bill that is already paid is locked."
              : "Bills are raised against a confirmed stay and are payable by the occupant like any other invoice."}
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
            <form.Field name="amount">
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor="utility-bill-amount">Amount</FieldLabel>
                  <Input
                    id="utility-bill-amount"
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="400"
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

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field name="billingPeriodStart">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor="utility-bill-start">
                      Period start
                    </FieldLabel>
                    <Input
                      id="utility-bill-start"
                      name="billingPeriodStart"
                      type="date"
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

              <form.Field name="billingPeriodEnd">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor="utility-bill-end">
                      Period end
                    </FieldLabel>
                    <Input
                      id="utility-bill-end"
                      name="billingPeriodEnd"
                      type="date"
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
                  <FieldLabel htmlFor="utility-bill-description">
                    Description
                  </FieldLabel>
                  <Input
                    id="utility-bill-description"
                    name="description"
                    placeholder="Electricity bill for September 2026"
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

            {isEdit ? (
              <form.Field name="status">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor="utility-bill-status">
                      Status
                    </FieldLabel>
                    <Select
                      items={BILL_STATUS_LABELS}
                      value={field.state.value || null}
                      onValueChange={(next) => {
                        if (next) field.handleChange(next as BillStatus);
                      }}
                    >
                      <SelectTrigger
                        id="utility-bill-status"
                        className="w-full"
                        aria-invalid={
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        }
                      >
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(BILL_STATUS_LABELS) as BillStatus[]).map(
                          (value) => (
                            <SelectItem key={value} value={value}>
                              {BILL_STATUS_LABELS[value]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    {field.state.meta.isTouched && !field.state.meta.isValid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )}
              </form.Field>
            ) : null}
          </div>

          <DialogFooter className="mt-5">
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={pending}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner aria-hidden="true" /> : null}
              {isEdit ? "Save changes" : "Create bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Create action for the detail drawer — only offered on a CONFIRMED stay. */
export function CreateUtilityBillButton({
  stayId,
}: CreateUtilityBillButtonProps) {
  return <UtilityBillDialog stayId={stayId} />;
}

/** Edit action for a utility bill that has not been paid yet. */
export function EditUtilityBillButton({ invoice }: EditUtilityBillButtonProps) {
  return <UtilityBillDialog invoice={invoice} />;
}
