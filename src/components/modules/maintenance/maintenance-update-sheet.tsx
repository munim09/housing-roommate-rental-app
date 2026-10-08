"use client";

import { useForm } from "@tanstack/react-form";
import {
  CalendarClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UpdateMaintenanceRequestInput } from "@/api/maintenance.api";
import { MaintenancePriorityBadge } from "@/components/shared/maintenance-priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUpdateMaintenanceRequest } from "@/hooks/maintenance.hook";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUSES,
  type MaintenanceRequest,
  type MaintenanceStatus,
} from "@/types";
import {
  localDateTimeToIso,
  type MaintenanceUpdateValues,
  maintenanceUpdateSchema,
  toDateTimeLocal,
} from "@/validation";

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      <span
        aria-hidden="true"
        className="flex size-5 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-3"
      >
        {icon}
      </span>
      {children}
    </h3>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm break-words">{children}</dd>
    </div>
  );
}

/** A status the backend does not know yet falls back to `OPEN`, never crashes. */
function normalizeStatus(status: string): MaintenanceStatus {
  return (MAINTENANCE_STATUSES as readonly string[]).includes(status)
    ? (status as MaintenanceStatus)
    : "OPEN";
}

export interface MaintenanceUpdateSheetProps {
  request: MaintenanceRequest;
  /** Current URL without `requestId` — closing writes this back. */
  closeHref: string;
}

/**
 * The owner / manager drawer for one maintenance request: what the tenant
 * reported, where, and the `PATCH /manager/maintenance-requests/:id` form that
 * moves it through `OPEN → IN_PROGRESS → RESOLVED / CLOSED / CANCELLED`.
 * Opening it is a URL change (`?requestId=…`), so the drawer is deep-linkable
 * and the Server Component resolves the row.
 */
export function MaintenanceUpdateSheet({
  request,
  closeHref,
}: MaintenanceUpdateSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const update = useUpdateMaintenanceRequest();

  const close = () => {
    setOpen(false);
    router.replace(closeHref, { scroll: false });
  };

  const stay = request.stay;
  const reporter = request.reportedBy;
  const stayLabel = [
    stay?.property?.name,
    stay?.flat?.flatNumber ? `Flat ${stay.flat.flatNumber}` : null,
    stay?.room?.roomNumber ? `Room ${stay.room.roomNumber}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const form = useForm({
    defaultValues: {
      status: normalizeStatus(request.status),
      scheduledFor: toDateTimeLocal(request.scheduledFor),
      resolvedAt: toDateTimeLocal(request.resolvedAt),
    } satisfies MaintenanceUpdateValues,
    validators: { onSubmit: maintenanceUpdateSchema },
    onSubmit: ({ value }) => {
      const body: UpdateMaintenanceRequestInput = { status: value.status };
      const scheduledFor = localDateTimeToIso(value.scheduledFor);
      // Resolving without picking a time stamps "now", so the row never reads
      // `RESOLVED` while `resolvedAt` is still empty.
      const resolvedAt =
        localDateTimeToIso(value.resolvedAt) ??
        (value.status === "RESOLVED" ? new Date().toISOString() : undefined);

      if (scheduledFor) body.scheduledFor = scheduledFor;
      if (resolvedAt) body.resolvedAt = resolvedAt;

      update.mutate(
        { requestId: request.id, body },
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
              title: "Request updated",
              description: `${request.issue} is now ${MAINTENANCE_STATUS_LABELS[value.status].toLowerCase()}.`,
              type: "success",
            });
            form.reset({
              status: value.status,
              scheduledFor: toDateTimeLocal(body.scheduledFor),
              resolvedAt: toDateTimeLocal(body.resolvedAt),
            });
            router.refresh();
          },
          onError: (err) => {
            toast.add({
              title: "Could not update the request",
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) router.replace(closeHref, { scroll: false });
      }}
    >
      <SheetContent className="w-full sm:max-w-xl">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          <SheetHeader>
            <SheetTitle className="pr-8">{request.issue}</SheetTitle>
            <SheetDescription className="pr-8">
              Reported by {reporter?.name ?? "a tenant"} ·{" "}
              {formatDate(request.createdAt)}
            </SheetDescription>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatusBadge status={(request.status ?? "").toUpperCase()} />
              <MaintenancePriorityBadge priority={request.priority} />
            </div>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-4">
            {request.description ? (
              <figure className="space-y-2 rounded-xl border bg-muted/40 p-4">
                <blockquote className="text-pretty text-sm italic">
                  “{request.description}”
                </blockquote>
                <figcaption className="text-xs text-muted-foreground">
                  {reporter?.name ?? "Tenant"} · {formatDate(request.createdAt)}
                </figcaption>
              </figure>
            ) : null}

            <section className="space-y-2">
              <SectionHeading icon={<MapPinIcon />}>Where</SectionHeading>
              <div className="rounded-xl border p-4">
                <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                  <Detail label="Property">{stayLabel || "—"}</Detail>
                  <Detail label="Address">
                    {stay?.property?.address ?? "—"}
                  </Detail>
                </dl>
              </div>
            </section>

            <section className="space-y-2">
              <SectionHeading icon={<UserIcon />}>Reported by</SectionHeading>
              <div className="rounded-xl border p-4">
                <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                  <Detail label="Name">{reporter?.name ?? "—"}</Detail>
                  <Detail label="Email">
                    {reporter?.email ? (
                      <a
                        href={`mailto:${reporter.email}`}
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <MailIcon aria-hidden="true" className="size-3.5" />
                        <span className="break-all">{reporter.email}</span>
                      </a>
                    ) : (
                      "—"
                    )}
                  </Detail>
                  <Detail label="Phone">
                    {reporter?.phone ? (
                      <a
                        href={`tel:${reporter.phone}`}
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <PhoneIcon aria-hidden="true" className="size-3.5" />
                        {reporter.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </Detail>
                </dl>
              </div>
            </section>

            <section className="space-y-2">
              <SectionHeading icon={<CalendarClockIcon />}>
                Timeline
              </SectionHeading>
              <div className="rounded-xl border p-4">
                <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-3">
                  <Detail label="Reported">
                    {formatDateTime(request.createdAt)}
                  </Detail>
                  <Detail label="Scheduled for">
                    {formatDateTime(request.scheduledFor)}
                  </Detail>
                  <Detail label="Resolved at">
                    {formatDateTime(request.resolvedAt)}
                  </Detail>
                </dl>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading icon={<CalendarClockIcon />}>
                Update request
              </SectionHeading>

              <form.Field name="status">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor="maintenance-status">Status</FieldLabel>
                    <Select
                      items={MAINTENANCE_STATUS_LABELS}
                      value={field.state.value || null}
                      onValueChange={(next) => {
                        if (next) field.handleChange(next as MaintenanceStatus);
                      }}
                    >
                      <SelectTrigger
                        id="maintenance-status"
                        className="w-full"
                        aria-invalid={
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        }
                      >
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAINTENANCE_STATUSES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {MAINTENANCE_STATUS_LABELS[value]}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="scheduledFor">
                  {(field) => (
                    <Field
                      data-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <FieldLabel htmlFor="maintenance-scheduledFor">
                        Scheduled for
                      </FieldLabel>
                      <Input
                        id="maintenance-scheduledFor"
                        name="scheduledFor"
                        type="datetime-local"
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

                <form.Field name="resolvedAt">
                  {(field) => (
                    <Field
                      data-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <FieldLabel htmlFor="maintenance-resolvedAt">
                        Resolved at
                      </FieldLabel>
                      <Input
                        id="maintenance-resolvedAt"
                        name="resolvedAt"
                        type="datetime-local"
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
              </div>

              <p className="text-xs text-muted-foreground text-pretty">
                Resolving without a timestamp stamps the current time. Leave the
                fields empty to keep the schedule as it is.
              </p>
            </section>
          </div>

          <SheetFooter>
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={update.isPending}
              >
                Close
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? <Spinner /> : null}
                Save changes
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
