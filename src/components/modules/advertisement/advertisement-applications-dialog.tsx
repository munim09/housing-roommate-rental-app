"use client";

import { ClipboardListIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdvertisementApplications, useApiErrorToast } from "@/hooks";
import { formatDate } from "@/lib/format";
import {
  type Advertisement,
  type ApplicationStayRecord,
  type OwnerManagerApplication,
  RENTAL_TYPE_LABELS,
  type RentalType,
} from "@/types";

function rentalTypeLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return RENTAL_TYPE_LABELS[value as RentalType] ?? value.replaceAll("_", " ");
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{value}</dd>
    </div>
  );
}

function StayRecordSection({ stay }: { stay: ApplicationStayRecord | null }) {
  if (!stay) {
    return (
      <div className="space-y-1 rounded-lg bg-muted/60 p-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Stay record
        </p>
        <p className="text-sm text-muted-foreground">
          No stay has been created for this application yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg bg-muted/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Stay record
        </p>
        <StatusBadge status={stay.status} />
      </div>
      <p className="text-sm">
        {formatDate(stay.startDate)} → {formatDate(stay.endDate)}
      </p>
    </div>
  );
}

function ApplicationRow({
  application,
}: {
  application: OwnerManagerApplication;
}) {
  const applicant = application.applicant;
  const contact = [applicant?.email, applicant?.phone]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <p className="font-medium">
            {applicant?.name ?? "Unnamed applicant"}
          </p>
          {contact ? (
            <p className="break-all text-xs text-muted-foreground">{contact}</p>
          ) : null}
        </div>
        <StatusBadge status={application.status} />
      </div>

      <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        <Detail
          label="Rental type"
          value={rentalTypeLabel(application.rentalType)}
        />
        <Detail label="Applied on" value={formatDate(application.createdAt)} />
        <Detail
          label="Requested period"
          value={`${formatDate(application.requestedStartDate)} → ${formatDate(application.requestedEndDate)}`}
        />
        <Detail
          label="Reviewed on"
          value={
            application.reviewedAt ? formatDate(application.reviewedAt) : "—"
          }
        />
      </dl>

      {application.note ? (
        <p className="text-xs text-muted-foreground text-pretty italic">
          “{application.note}”
        </p>
      ) : null}

      <StayRecordSection stay={application.stay ?? null} />
    </li>
  );
}

export interface AdvertisementApplicationsDialogProps {
  advertisement: Advertisement;
}

/**
 * Modal behind the "Applications" button on `/manage-advertisement`. The
 * backend only lists applications for the signed-in owner/manager, so the
 * cached list is filtered to this advertisement's id before rendering.
 */
export function AdvertisementApplicationsDialog({
  advertisement,
}: AdvertisementApplicationsDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    data = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdvertisementApplications(advertisement.id, open);

  useApiErrorToast(error, "Could not load applications");

  const stayCount = data.filter((application) => application.stay).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <ClipboardListIcon aria-hidden="true" />
        Applications
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Applications &amp; stays</DialogTitle>
          <DialogDescription>
            Every application and stay record submitted for{" "}
            <span className="text-foreground">{advertisement.title}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {isPending ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-3 rounded-xl border p-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardListIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Could not load applications</EmptyTitle>
                <EmptyDescription>
                  {(error as { message?: string } | null)?.message ??
                    "Something went wrong. Please try again."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  <RefreshCwIcon aria-hidden="true" />
                  Try again
                </Button>
              </EmptyContent>
            </Empty>
          ) : data.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardListIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No applications yet</EmptyTitle>
                <EmptyDescription>
                  When a tenant applies for this listing, the application and
                  its stay record will show up here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {data.length} application{data.length === 1 ? "" : "s"} ·{" "}
                {stayCount} stay record{stayCount === 1 ? "" : "s"}
              </p>
              <ul className="grid gap-3">
                {data.map((application) => (
                  <ApplicationRow
                    key={application.id}
                    application={application}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
