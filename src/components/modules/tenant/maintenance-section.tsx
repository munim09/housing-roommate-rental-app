"use client";

import { useForm } from "@tanstack/react-form";
import { PlusIcon, WrenchIcon } from "lucide-react";
import { useState } from "react";
import { MaintenancePriorityBadge } from "@/components/shared/maintenance-priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  useCreateMaintenanceRequest,
  useMaintenanceRequestsByStay,
} from "@/hooks/maintenance.hook";
import { useApiErrorToast } from "@/hooks/use-error-toast";
import { formatDate } from "@/lib/format";
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_PRIORITY_LABELS,
  type MaintenancePriority,
  type MaintenanceRequest,
} from "@/types";
import {
  EMPTY_MAINTENANCE_REQUEST_VALUES,
  type MaintenanceRequestValues,
  maintenanceRequestSchema,
} from "@/validation";

function RequestCard({ request }: { request: MaintenanceRequest }) {
  return (
    <li className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{request.issue}</p>
            <StatusBadge status={(request.status ?? "").toUpperCase()} />
            <MaintenancePriorityBadge priority={request.priority} />
          </div>

          {request.description ? (
            <p className="text-sm text-muted-foreground text-pretty">
              {request.description}
            </p>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Reported {formatDate(request.createdAt)}
            {request.scheduledFor
              ? ` · Scheduled ${formatDate(request.scheduledFor)}`
              : ""}
            {request.resolvedAt
              ? ` · Resolved ${formatDate(request.resolvedAt)}`
              : ""}
          </p>
        </div>
      </div>
    </li>
  );
}

/**
 * The tenant's maintenance requests for one stay plus the `POST
 * /tenant/maintenance-requests` form. The create action is offered only while
 * the stay has started (`CONFIRMED`), because the backend rejects requests on
 * a stay that is still waiting for its first payment.
 */
export function MaintenanceSection({
  stayId,
  canCreate = false,
}: {
  stayId: string;
  canCreate?: boolean;
}) {
  const requests = useMaintenanceRequestsByStay(stayId);
  const createRequest = useCreateMaintenanceRequest();
  const [open, setOpen] = useState(false);

  useApiErrorToast(requests.error, "Could not load maintenance requests");

  const rows = [...(requests.data ?? [])].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );

  const form = useForm({
    defaultValues:
      EMPTY_MAINTENANCE_REQUEST_VALUES satisfies MaintenanceRequestValues,
    validators: { onSubmit: maintenanceRequestSchema },
    onSubmit: ({ value }) => {
      createRequest.mutate(
        {
          stayId,
          issue: value.issue.trim(),
          description: value.description.trim(),
          priority: value.priority,
        },
        {
          onSuccess: (res) => {
            if (!res.success) {
              toast.add({
                title: "Server failure",
                description:
                  res.message ?? "Something went wrong. Please try again.",
                type: "error",
              });
              return;
            }

            toast.add({
              title: "Request submitted",
              description:
                "The property manager has been notified and will update the status.",
              type: "success",
            });
            form.reset();
            setOpen(false);
          },
          onError: (err) => {
            toast.add({
              title: "Could not submit the request",
              description:
                err.message || "Something went wrong. Please try again.",
              type: "error",
            });
          },
        },
      );
    },
  });

  return (
    <section aria-labelledby="maintenance-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="maintenance-heading"
          className="text-xl font-semibold tracking-tight"
        >
          Maintenance requests
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {rows.length} total
          </span>
          {canCreate && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button />}>
                <PlusIcon aria-hidden="true" />
                New request
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report a maintenance issue</DialogTitle>
                  <DialogDescription>
                    Describe the problem on this stay and set how urgent it is.
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
                    <form.Field name="issue">
                      {(field) => (
                        <Field
                          data-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                        >
                          <FieldLabel htmlFor="maintenance-issue">
                            Issue
                          </FieldLabel>
                          <Input
                            id="maintenance-issue"
                            name="issue"
                            autoComplete="off"
                            placeholder="Water heater not working"
                            value={field.state.value}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            onBlur={field.handleBlur}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                          />
                          {field.state.meta.isTouched &&
                          !field.state.meta.isValid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="description">
                      {(field) => (
                        <Field
                          data-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                        >
                          <FieldLabel htmlFor="maintenance-description">
                            Description
                          </FieldLabel>
                          <Textarea
                            id="maintenance-description"
                            name="description"
                            rows={4}
                            placeholder="No hot water since yesterday morning"
                            value={field.state.value}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            onBlur={field.handleBlur}
                            aria-invalid={
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid
                            }
                          />
                          {field.state.meta.isTouched &&
                          !field.state.meta.isValid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="priority">
                      {(field) => (
                        <Field
                          data-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          }
                        >
                          <FieldLabel htmlFor="maintenance-priority">
                            Priority
                          </FieldLabel>
                          <Select
                            items={MAINTENANCE_PRIORITY_LABELS}
                            value={field.state.value || null}
                            onValueChange={(next) => {
                              if (next) {
                                field.handleChange(next as MaintenancePriority);
                              }
                            }}
                          >
                            <SelectTrigger
                              id="maintenance-priority"
                              className="w-full"
                              aria-invalid={
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid
                              }
                            >
                              <SelectValue placeholder="Select a priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {MAINTENANCE_PRIORITIES.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {MAINTENANCE_PRIORITY_LABELS[value]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.state.meta.isTouched &&
                          !field.state.meta.isValid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <DialogFooter className="mt-5">
                    <DialogClose
                      render={<Button type="button" variant="outline" />}
                      disabled={createRequest.isPending}
                    >
                      Cancel
                    </DialogClose>
                    <Button type="submit" disabled={createRequest.isPending}>
                      {createRequest.isPending ? <Spinner /> : null}
                      Submit request
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {canCreate
          ? "Anything broken in the flat? Report it here and track every status change."
          : "Requests can be created once the stay has started."}
      </p>

      {requests.isPending ? (
        <ul className="space-y-3" aria-busy="true">
          <li>
            <Skeleton className="h-20 w-full" />
          </li>
          <li>
            <Skeleton className="h-20 w-full" />
          </li>
        </ul>
      ) : rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WrenchIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No maintenance requests</EmptyTitle>
            <EmptyDescription>
              {canCreate
                ? "Nothing reported on this stay yet."
                : "Nothing has been reported on this stay."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {rows.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </ul>
      )}
    </section>
  );
}
