"use client";

import { cn } from "cn";
import {
  BanknoteIcon,
  CalendarIcon,
  ClipboardListIcon,
  FileSignatureIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ReceiptIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  type OwnerManagerApplication,
  RENTAL_TYPE_LABELS,
  type RentalType,
  type StayRecord,
} from "@/types";
import { ApplicationDecisionButtons } from "./application-decision-buttons";
import { ApplicationInvoices } from "./application-invoices";
import { CreateUtilityBillButton } from "./utility-bill-dialog";

function rentalTypeLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return RENTAL_TYPE_LABELS[value as RentalType] ?? value.replaceAll("_", " ");
}

/** "Rafi Ahmed" -> "RA"; an unnamed applicant falls back to a placeholder. */
function initials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** One plain-language line per terminal status, so the drawer always explains itself. */
const STATUS_HEADLINE: Record<string, string> = {
  APPROVED: "Approved — the stay record is live",
  REJECTED: "Rejected — no stay will be created",
  WITHDRAWN: "Withdrawn by the applicant",
  EXPIRED: "Expired without a decision",
};

const STATUS_NOTE: Record<string, string> = {
  APPROVED: "Rent and utility invoices can be issued against the stay below.",
  REJECTED:
    "The application stays on file and the applicant may apply for another listing.",
  WITHDRAWN:
    "The applicant pulled this application back before it was reviewed.",
  EXPIRED: "No decision was made within the application window.",
};

function statusHeadline(status: string): string {
  return (
    STATUS_HEADLINE[status] ??
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}

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

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm break-words">{children}</dd>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-muted/40 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        <span
          aria-hidden="true"
          className="flex size-4 items-center justify-center [&_svg]:size-3.5"
        >
          {icon}
        </span>
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-snug font-medium">{value}</p>
    </div>
  );
}

export interface ApplicationDetailSheetProps {
  application: OwnerManagerApplication;
  /**
   * The full stay row joined from `GET /tenant/stays`. It is `null` until the
   * application is approved; the short `application.stay` summary still shows
   * the status and period in that case.
   */
  stay: StayRecord | null;
  /** Current URL without `applicationId` — closing writes this back. */
  closeHref: string;
}

/**
 * One application, end to end: who applied, for which listing, the stay record
 * minted by approval, and the invoices raised against that stay. Opening it is
 * a URL change (`?applicationId=…`), so the drawer is deep-linkable and the
 * Server Component resolves it.
 *
 * Reading order is deliberate: status (and, while pending, the decision) first,
 * then the numbers, then the detail sections underneath.
 */
export function ApplicationDetailSheet({
  application,
  stay,
  closeHref,
}: ApplicationDetailSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [showInvoices, setShowInvoices] = useState(false);

  const applicant = application.applicant;
  const advertisement = application.advertisement;
  const staySummary = application.stay;
  const hasStay = Boolean(staySummary);
  const contractUrl = stay?.contractUrl;
  const isPending = application.status === "PENDING";

  const stayId = stay?.id ?? staySummary?.id ?? null;
  // Statuses can arrive lowercase from the API, so compare uppercased.
  const stayStatus = String(
    stay?.status ?? staySummary?.status ?? "",
  ).toUpperCase();
  const canRaiseUtilityBill = Boolean(stayId) && stayStatus === "CONFIRMED";

  const stayLabel = [
    stay?.property?.name,
    stay?.flat?.flatNumber ? `Flat ${stay.flat.flatNumber}` : null,
    stay?.room?.roomNumber ? `Room ${stay.room.roomNumber}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const stayPeriod = `${formatDate(stay?.startDate ?? staySummary?.startDate)} → ${formatDate(stay?.endDate ?? staySummary?.endDate)}`;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) router.replace(closeHref, { scroll: false });
      }}
    >
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start gap-3 pr-8">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
            >
              {initials(applicant?.name)}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <SheetTitle className="truncate">
                {applicant?.name ?? "Unnamed applicant"}
              </SheetTitle>
              <SheetDescription className="truncate">
                {advertisement?.title ?? "Listing unavailable"}
              </SheetDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pl-14">
            <StatusBadge status={application.status} />
            <Badge variant="outline">
              {rentalTypeLabel(application.rentalType)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Applied {formatDate(application.createdAt)}
            </span>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          {isPending ? (
            <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Awaiting your decision</p>
                <p className="text-xs text-muted-foreground text-pretty">
                  Approving creates the stay record for{" "}
                  {applicant?.name ?? "this applicant"}; rejecting keeps the
                  application on file.
                </p>
              </div>
              <ApplicationDecisionButtons
                application={application}
                size="default"
              />
            </div>
          ) : (
            <div className="space-y-1 rounded-xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">
                {statusHeadline(application.status)}
              </p>
              <p className="text-xs text-muted-foreground text-pretty">
                {STATUS_NOTE[application.status] ??
                  "No further action is needed for this application."}
                {application.reviewedAt
                  ? ` Reviewed ${formatDate(application.reviewedAt)}.`
                  : ""}
              </p>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-3">
            <SummaryCard
              icon={<BanknoteIcon />}
              label="Monthly rent"
              value={
                advertisement?.monthlyRent
                  ? formatCurrency(Number(advertisement.monthlyRent))
                  : "—"
              }
            />
            <SummaryCard
              icon={<CalendarIcon />}
              label="Requested stay"
              value={
                <>
                  {formatDate(application.requestedStartDate)}
                  <br />→ {formatDate(application.requestedEndDate)}
                </>
              }
            />
            <SummaryCard
              icon={<ClipboardListIcon />}
              label="Reviewed on"
              value={
                application.reviewedAt
                  ? formatDate(application.reviewedAt)
                  : "Not yet"
              }
            />
          </div>

          {application.note ? (
            <figure className="space-y-2 rounded-xl border bg-muted/40 p-4">
              <blockquote className="text-pretty text-sm italic">
                “{application.note}”
              </blockquote>
              <figcaption className="text-xs text-muted-foreground">
                {applicant?.name ?? "Applicant"} ·{" "}
                {formatDate(application.createdAt)}
              </figcaption>
            </figure>
          ) : null}

          <section className="space-y-2">
            <SectionHeading icon={<UserIcon />}>Applicant</SectionHeading>
            <div className="rounded-xl border p-4">
              <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <Field label="Full name" className="sm:col-span-2">
                  {applicant?.name ?? "—"}
                </Field>
                <Field label="Email">
                  {applicant?.email ? (
                    <a
                      href={`mailto:${applicant.email}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <MailIcon aria-hidden="true" className="size-3.5" />
                      <span className="break-all">{applicant.email}</span>
                    </a>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Phone">
                  {applicant?.phone ? (
                    <a
                      href={`tel:${applicant.phone}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <PhoneIcon aria-hidden="true" className="size-3.5" />
                      {applicant.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </Field>
              </dl>
            </div>
          </section>

          <section className="space-y-2">
            <SectionHeading icon={<ClipboardListIcon />}>
              Listing
            </SectionHeading>
            <div className="rounded-xl border p-4">
              <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <Field label="Title" className="sm:col-span-2">
                  {advertisement?.title ?? "Listing unavailable"}
                </Field>
                <Field label="Rental type">
                  {rentalTypeLabel(application.rentalType)}
                </Field>
                <Field label="Listing status">
                  {advertisement?.status ? (
                    <StatusBadge status={advertisement.status} />
                  ) : (
                    "—"
                  )}
                </Field>
              </dl>
            </div>
          </section>

          <section className="space-y-2">
            <SectionHeading icon={<MapPinIcon />}>Stay record</SectionHeading>

            {!hasStay ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground text-pretty">
                No stay exists yet — one is created as soon as this application
                is approved.
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {stayLabel || "Stay record"}
                  </p>
                  <StatusBadge
                    status={stay?.status ?? staySummary?.status ?? "PENDING"}
                  />
                </div>

                <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                  <Field label="Stay period">{stayPeriod}</Field>
                  <Field label="Monthly rent">
                    {stay?.monthlyRent != null
                      ? formatCurrency(Number(stay.monthlyRent))
                      : "—"}
                  </Field>
                  <Field label="Occupant" className="sm:col-span-2">
                    {stay?.occupant?.name
                      ? `${stay.occupant.name}${stay.occupant.email ? ` · ${stay.occupant.email}` : ""}`
                      : (applicant?.name ?? "—")}
                  </Field>
                  <Field label="Property address" className="sm:col-span-2">
                    {stay?.property?.address ?? "—"}
                  </Field>
                </dl>

                {contractUrl ? (
                  <a
                    href={contractUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-fit no-underline",
                    )}
                  >
                    <FileSignatureIcon aria-hidden="true" />
                    View contract
                  </a>
                ) : null}
              </div>
            )}
          </section>

          {showInvoices ? (
            <section className="space-y-2">
              <SectionHeading icon={<ReceiptIcon />}>Invoices</SectionHeading>
              <ApplicationInvoices applicationId={application.id} />
            </section>
          ) : null}
        </div>

        <SheetFooter>
          <div className="flex w-full flex-wrap items-end justify-between gap-3">
            <div className="grid gap-1">
              {canRaiseUtilityBill && stayId ? (
                <CreateUtilityBillButton stayId={stayId} />
              ) : hasStay ? (
                <p className="max-w-64 text-xs text-muted-foreground text-pretty">
                  A utility bill can be raised once this stay is confirmed.
                </p>
              ) : null}
            </div>

            {hasStay ? (
              <Button
                type="button"
                size="sm"
                aria-expanded={showInvoices}
                onClick={() => setShowInvoices((current) => !current)}
              >
                <ReceiptIcon aria-hidden="true" />
                {showInvoices ? "Hide invoices" : "View invoices"}
              </Button>
            ) : null}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
