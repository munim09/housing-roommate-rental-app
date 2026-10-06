"use client";

import {
  CircleCheckIcon,
  CreditCardIcon,
  TriangleAlertIcon,
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
import { Spinner } from "@/components/ui/spinner";
import { usePayInvoice } from "@/hooks/payment.hook";
import { formatCurrency, formatDate } from "@/lib/format";
import { isInvoiceOverdue, payableInvoiceIds } from "@/lib/payable-invoice";
import type { Invoice, InvoiceKind, InvoicePayment } from "@/types";

interface SectionCopy {
  title: string;
  description: string;
  empty: string;
}

const SECTION_COPY: Record<InvoiceKind, SectionCopy> = {
  RENT: {
    title: "Rent invoices",
    description:
      "Rent installments unlock one at a time — the earliest unpaid installment by due date is the one you can pay.",
    empty: "No rent invoice has been issued for this stay yet.",
  },
  UTILITY: {
    title: "Utility invoices",
    description: "Every pending utility bill can be settled right away.",
    empty: "No utility bill has been issued for this stay yet.",
  },
};

function latestPayment(invoice: Invoice): InvoicePayment | undefined {
  const payments = invoice.payments ?? [];

  // Failed attempts carry no `paidAt`, so they sort as "oldest" instead of
  // producing a NaN ordering.
  const stamp = (payment: InvoicePayment) => {
    const parsed = Date.parse(payment.paidAt ?? "");

    return Number.isFinite(parsed) ? parsed : 0;
  };

  return [...payments].sort(
    (a, b) => stamp(b) - stamp(a) || b.id.localeCompare(a.id),
  )[0];
}

function billingPeriod(invoice: Invoice): string {
  return `${formatDate(invoice.billingPeriodStart)} – ${formatDate(invoice.billingPeriodEnd)}`;
}

/**
 * One invoice kind ("Rent invoices" / "Utility invoices"): every invoice of
 * that type with its status, billing period, due date and payee, plus the pay
 * button the backend would actually accept — all pending utility bills and the
 * single earliest-due pending rent installment.
 */
export function InvoiceSection({
  invoices,
  type,
}: {
  invoices: Invoice[];
  type: InvoiceKind;
}) {
  const pay = usePayInvoice();
  const copy = SECTION_COPY[type];
  const payable = payableInvoiceIds(invoices);

  const rows = invoices
    .filter((invoice) => invoice.type === type)
    .sort((a, b) =>
      type === "RENT"
        ? Date.parse(a.dueDate) - Date.parse(b.dueDate)
        : Date.parse(b.dueDate) - Date.parse(a.dueDate),
    );

  return (
    <section
      aria-labelledby={`invoices-${type.toLowerCase()}`}
      className="space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id={`invoices-${type.toLowerCase()}`}
          className="text-xl font-semibold tracking-tight"
        >
          {copy.title}
        </h2>
        <span className="text-sm text-muted-foreground">
          {rows.length} total
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{copy.description}</p>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CreditCardIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Nothing to pay here</EmptyTitle>
            <EmptyDescription>{copy.empty}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {rows.map((invoice) => {
            const canPay = payable.has(invoice.id);
            const overdue = isInvoiceOverdue(invoice);
            const paid = invoice.status === "PAID";
            const payment = latestPayment(invoice);
            const isPayingThis = pay.isPending && pay.variables === invoice.id;

            return (
              <li
                key={invoice.id}
                className="rounded-xl border bg-card p-4 shadow-xs"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {invoice.description ||
                          (type === "RENT"
                            ? "Rent installment"
                            : "Utility bill")}
                      </p>
                      <StatusBadge status={invoice.status} />
                      {overdue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          <TriangleAlertIcon
                            className="size-3"
                            aria-hidden="true"
                          />
                          Overdue
                        </span>
                      )}
                      {paid && payment && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CircleCheckIcon
                            className="size-3.5 text-primary"
                            aria-hidden="true"
                          />
                          Paid {formatDate(payment.paidAt)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Billing period {billingPeriod(invoice)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due {formatDate(invoice.dueDate)}
                      {invoice.receiver?.name
                        ? ` · Payable to ${invoice.receiver.name}`
                        : ""}
                    </p>

                    {payment && (
                      <p className="text-xs text-muted-foreground">
                        Payment ref {payment.transactionReference} ·{" "}
                        <StatusBadge status={payment.status} />
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <p className="text-lg font-semibold tabular-nums">
                      {formatCurrency(Number(invoice.amount))}
                    </p>

                    {canPay && (
                      <Button
                        onClick={() => pay.mutate(invoice.id)}
                        disabled={pay.isPending}
                      >
                        {isPayingThis ? (
                          <>
                            <Spinner className="size-4" />
                            Redirecting…
                          </>
                        ) : (
                          <>
                            <CreditCardIcon aria-hidden="true" />
                            Pay now
                          </>
                        )}
                      </Button>
                    )}

                    {!canPay && invoice.status === "PENDING" && (
                      <p className="text-xs text-muted-foreground sm:text-right">
                        {type === "RENT"
                          ? "Opens after the earlier installment is paid"
                          : "Not payable right now"}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
