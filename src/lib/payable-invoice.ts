import type { Invoice } from "@/types";

/**
 * Which pending invoices may be paid right now.
 *
 * Mirrors `PaymentService.initiatePayment` on the backend: every pending
 * UTILITY bill is payable at any time, while rent installments are strictly
 * ordered by due date — only the earliest unpaid one may be settled. Handing
 * the button to a later rent invoice would only produce a backend rejection.
 */
export function payableInvoiceIds(invoices: Invoice[]): Set<string> {
  const payable = new Set<string>();

  for (const invoice of invoices) {
    if (invoice.status === "PENDING" && invoice.type === "UTILITY") {
      payable.add(invoice.id);
    }
  }

  const nextRent = nextPayableRentInvoice(invoices);

  if (nextRent) payable.add(nextRent.id);

  return payable;
}

/** Earliest-due pending rent invoice, or `null` when rent is fully settled. */
export function nextPayableRentInvoice(invoices: Invoice[]): Invoice | null {
  const pendingRent = invoices.filter(
    (invoice) => invoice.status === "PENDING" && invoice.type === "RENT",
  );

  if (pendingRent.length === 0) return null;

  return pendingRent.reduce((earliest, invoice) =>
    Date.parse(invoice.dueDate) < Date.parse(earliest.dueDate)
      ? invoice
      : earliest,
  );
}

/** A pending invoice whose due date has already passed. */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status !== "PENDING") return false;

  const due = Date.parse(invoice.dueDate);

  return Number.isFinite(due) && due < Date.now();
}
