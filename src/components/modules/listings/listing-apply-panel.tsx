"use client";

import { useForm } from "@tanstack/react-form";
import {
  ArrowRightIcon,
  CalendarRangeIcon,
  CheckCircle2Icon,
  LayoutDashboardIcon,
  LogInIcon,
  ShieldAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TenantApplication } from "@/api/tenant.api";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateApplication } from "@/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { ROLE_HOME } from "@/lib/session";
import {
  RENTAL_TYPE_LABELS,
  type RentalType,
  USER_ROLE_LABELS,
  type UserRole,
} from "@/types";
import { type ApplicationValues, applicationSchema } from "@/validation";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `"2026-10-01T00:00:00.000Z"` or `"2026-10-01"` → `"2026-10-01"`. */
function isoDay(value?: string | null): string {
  if (!value) return "";
  const day = value.slice(0, 10);
  return ISO_DATE.test(day) ? day : "";
}

function isValidDay(value: string) {
  return ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));
}

function StaySummary({
  start,
  end,
  monthlyRent,
  rentalType,
}: {
  start: string;
  end: string;
  monthlyRent: number;
  rentalType: RentalType;
}) {
  const rows = [
    { label: "Monthly rent", value: formatCurrency(monthlyRent) },
    {
      label: "Requested stay",
      value:
        isValidDay(start) && isValidDay(end)
          ? `${formatDate(start)} – ${formatDate(end)}`
          : "Pick your dates",
    },
    { label: "Rental type", value: RENTAL_TYPE_LABELS[rentalType] },
  ];

  return (
    <dl className="grid gap-2 rounded-xl border bg-muted/40 p-4">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3"
        >
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd className="text-right text-sm font-medium tabular-nums">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SubmittedCard({ application }: { application: TenantApplication }) {
  const rows = [
    { label: "Application ID", value: application.id, mono: true },
    {
      label: "Listing",
      value: application.advertisement?.title ?? "This listing",
    },
    {
      label: "Requested stay",
      value: `${formatDate(application.requestedStartDate)} – ${formatDate(application.requestedEndDate)}`,
    },
  ];

  return (
    <section
      className="grid gap-4 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="grid gap-1">
          <h2 className="font-semibold tracking-tight">
            Application submitted
          </h2>
          <p className="text-sm text-muted-foreground text-pretty">
            The owner reviews new applications and creates the stay record once
            it is approved.
          </p>
        </div>
      </div>

      <dl className="grid gap-3 rounded-xl border bg-muted/40 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <StatusBadge
              status={(application.status ?? "PENDING").toUpperCase()}
            />
          </dd>
        </div>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3"
          >
            <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
            <dd
              className={row.mono ? "truncate font-mono text-xs" : "text-right"}
            >
              {row.value}
            </dd>
          </div>
        ))}
        {application.note ? (
          <div className="grid gap-1 border-t pt-3">
            <dt className="text-muted-foreground">Your note</dt>
            <dd className="text-pretty">{application.note}</dd>
          </div>
        ) : null}
      </dl>

      <div className="grid gap-2">
        <Button nativeButton={false} render={<Link href="/tenant/dashboard" />}>
          <LayoutDashboardIcon aria-hidden="true" />
          Go to tenant dashboard
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/tenant/application/${application.id}`} />}
        >
          View application
        </Button>
      </div>
    </section>
  );
}

function NoticeCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </span>
        <div className="grid gap-1">
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export interface ListingApplyPanelProps {
  advertisementId: string;
  title: string;
  rentalType: RentalType;
  monthlyRent: number;
  availableFrom: string;
  availableTo: string;
  /** Dates carried in the search URL; the form opens pre-filled with them. */
  stayFrom?: string | null;
  stayTo?: string | null;
  /** Verified session role, read on the server from the access token. */
  viewerRole: UserRole | null;
  viewerName?: string;
  /** Full detail URL, so a guest comes back here after signing in. */
  returnTo: string;
}

export function ListingApplyPanel({
  advertisementId,
  title,
  rentalType,
  monthlyRent,
  availableFrom,
  availableTo,
  stayFrom,
  stayTo,
  viewerRole,
  viewerName,
  returnTo,
}: ListingApplyPanelProps) {
  const router = useRouter();
  const create = useCreateApplication();
  const [submitted, setSubmitted] = useState<TenantApplication | null>(null);

  const availableFromDay = isoDay(availableFrom);
  const availableToDay = isoDay(availableTo);
  const defaultStart = isValidDay(isoDay(stayFrom))
    ? isoDay(stayFrom)
    : availableFromDay;
  const defaultEnd = isValidDay(isoDay(stayTo))
    ? isoDay(stayTo)
    : availableToDay;

  const form = useForm({
    defaultValues: {
      requestedStartDate: defaultStart,
      requestedEndDate: defaultEnd,
      note: "",
    } satisfies ApplicationValues,
    validators: {
      onSubmit: applicationSchema,
    },
    onSubmit: ({ value }) => {
      create.mutate(
        {
          advertisementId,
          requestedStartDate: value.requestedStartDate,
          requestedEndDate: value.requestedEndDate,
          note: value.note.trim() ? value.note.trim() : undefined,
        },
        {
          onSuccess: (response) => {
            if (!response.success || !response.data) {
              toast.add({
                title: "Application not submitted",
                description:
                  response.message ??
                  "The server rejected this application. Please try again.",
                type: "error",
              });
              return;
            }

            setSubmitted(response.data);
            toast.add({
              title: "Application submitted",
              description:
                response.message ??
                `${title} for ${formatDate(response.data.requestedStartDate)} – ${formatDate(response.data.requestedEndDate)}.`,
              type: "success",
            });
          },
          onError: (error) => {
            // The form was rendered from a server-checked session; if the
            // token expired since then, go back through login with this exact
            // URL (`?from=`) so area and dates survive the round trip.
            if (error.statusCode === 401) {
              toast.add({
                title: "Session expired",
                description: "Sign in again to submit this application.",
                type: "error",
              });
              router.replace(`/login?from=${encodeURIComponent(returnTo)}`);
              return;
            }

            toast.add({
              title: "Could not submit application",
              description: error.message,
              type: "error",
            });
          },
        },
      );
    },
  });

  const summary = (
    <StaySummary
      start={defaultStart}
      end={defaultEnd}
      monthlyRent={monthlyRent}
      rentalType={rentalType}
    />
  );

  if (submitted) return <SubmittedCard application={submitted} />;

  if (!viewerRole) {
    return (
      <div className="grid gap-4">
        {summary}
        <NoticeCard
          icon={<LogInIcon className="size-5" aria-hidden="true" />}
          title="Sign in to apply"
          description="Applications are sent from a tenant account. Sign in — or use the demo tenant login — and you will land back on this listing."
        >
          <div className="grid gap-2">
            <Button
              nativeButton={false}
              render={
                <Link href={`/login?from=${encodeURIComponent(returnTo)}`} />
              }
            >
              Sign in to apply
              <ArrowRightIcon aria-hidden="true" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              No account yet?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Create one
              </Link>
            </p>
          </div>
        </NoticeCard>
      </div>
    );
  }

  if (viewerRole !== "TENANT") {
    return (
      <div className="grid gap-4">
        {summary}
        <NoticeCard
          icon={<ShieldAlertIcon className="size-5" aria-hidden="true" />}
          title="Tenant account required"
          description={`You are signed in as ${USER_ROLE_LABELS[viewerRole]}. Only a tenant can apply for a stay on a listing.`}
        >
          <Button
            nativeButton={false}
            render={<Link href={ROLE_HOME[viewerRole]} />}
          >
            <LayoutDashboardIcon aria-hidden="true" />
            Go to my dashboard
          </Button>
        </NoticeCard>
      </div>
    );
  }

  return (
    <section className="grid gap-4 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="grid gap-1">
        <h2 className="font-semibold tracking-tight">Apply for this stay</h2>
        <p className="text-sm text-muted-foreground text-pretty">
          {viewerName ? `Welcome, ${viewerName}. ` : ""}
          Adjust the dates, add a short note and send it to the owner.
        </p>
      </div>

      {summary}

      <form
        className="grid gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="requestedStartDate">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="requestedStartDate">Move-in</FieldLabel>
              <Input
                id="requestedStartDate"
                name="requestedStartDate"
                type="date"
                value={field.state.value}
                min={availableFromDay || undefined}
                max={availableToDay || undefined}
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

        <form.Field name="requestedEndDate">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="requestedEndDate">Move-out</FieldLabel>
              <Input
                id="requestedEndDate"
                name="requestedEndDate"
                type="date"
                value={field.state.value}
                min={
                  form.state.values.requestedStartDate ||
                  availableFromDay ||
                  undefined
                }
                max={availableToDay || undefined}
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

        <form.Field name="note">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="note">
                Note to the owner{" "}
                <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="note"
                name="note"
                rows={3}
                placeholder="Working professional, no pets…"
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

        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <CalendarRangeIcon className="size-4 shrink-0" aria-hidden="true" />
          Available {formatDate(availableFrom)} – {formatDate(availableTo)}
        </div>

        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? <Spinner /> : null}
          Submit application
          {create.isPending ? null : <ArrowRightIcon aria-hidden="true" />}
        </Button>
      </form>
    </section>
  );
}
