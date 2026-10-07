"use client";

import {
  DropletsIcon,
  HomeIcon,
  ReceiptIcon,
  RefreshCwIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiErrorToast, useInvoicesByStay } from "@/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/types";

function invoicePeriod(invoice: Invoice) {
  return `${formatDate(invoice.billingPeriodStart)} → ${formatDate(invoice.billingPeriodEnd)}`;
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const isUtility = invoice.type === "UTILITY";

  return (
    <li className="grid gap-3 rounded-xl border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4"
          >
            {isUtility ? <DropletsIcon /> : <HomeIcon />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {isUtility ? "Utility bill" : "Rent"}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoicePeriod(invoice)}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(Number(invoice.amount))}
          </p>
          <StatusBadge status={invoice.status} className="mt-1" />
        </div>
      </div>

      <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Due</dt>
          <dd>{formatDate(invoice.dueDate)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Payable to</dt>
          <dd className="truncate">{invoice.receiver?.name ?? "—"}</dd>
        </div>
      </dl>

      {invoice.description ? (
        <p className="text-pretty text-xs text-muted-foreground italic">
          “{invoice.description}”
        </p>
      ) : null}
    </li>
  );
}

export interface ApplicationInvoicesProps {
  /** The application the drawer is on — invoices are resolved through it. */
  applicationId: string;
}

/**
 * Read-only invoice list behind the "View invoices" toggle. Only rendered once
 * the application owns a stay, because the endpoint 404s otherwise, and the
 * failure is contained here instead of taking the whole drawer down.
 */
export function ApplicationInvoices({
  applicationId,
}: ApplicationInvoicesProps) {
  const {
    data: invoices = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useInvoicesByStay(applicationId);

  useApiErrorToast(error, "Could not load invoices");

  if (isPending) {
    return (
      <div className="grid gap-2">
        {[0, 1].map((index) => (
          <div key={index} className="space-y-2 rounded-lg border p-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-3 rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "Could not load invoices."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-center"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ReceiptIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No invoices yet</EmptyTitle>
          <EmptyDescription>
            Rent and utility invoices issued for this stay will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="grid gap-2">
      {invoices.map((invoice) => (
        <InvoiceRow key={invoice.id} invoice={invoice} />
      ))}
    </ul>
  );
}
