import { cn } from "cn";
import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PaymentRecord } from "@/types";

interface PaymentStatusCardProps {
  /** Which gateway leg sent the visitor here. */
  intent: "success" | "cancel";
  /** The transaction reference, when the redirect carried one. */
  reference?: string | null;
  /** Result of `GET /payments/check/:transactionReference`, when it resolved. */
  payment?: PaymentRecord | null;
  /** Why the lookup failed — rendered instead of the status rows. */
  error?: string | null;
  /** Extra line for a cancel redirect that named a reason instead of a ref. */
  note?: string | null;
  /** Same-URL link behind "Check again". */
  checkHref: string;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="flex items-start justify-between gap-4 border-b py-2 last:border-b-0">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium break-all tabular-nums">
        {value}
      </dd>
    </div>
  );
}

/**
 * The shared face of `/payment/success/:transactionReference` and
 * `/payment/cancel`: who initiated it, how much, and what the gateway finally
 * said. Both pages stay public, so every link here works for a signed-out
 * visitor too.
 */
export function PaymentStatusCard({
  intent,
  reference,
  payment,
  error,
  note,
  checkHref,
}: PaymentStatusCardProps) {
  const confirmed = payment?.status === "SUCCESS";
  const showSuccessFace =
    confirmed || (intent === "success" && !payment && !error);
  const headline = showSuccessFace
    ? "Payment received"
    : "Payment not completed";
  const description = payment
    ? "The gateway reported the following for this transaction."
    : error
      ? "We could not confirm this transaction with the payment gateway."
      : intent === "success"
        ? "We are still confirming this transaction with the payment gateway."
        : "This transaction was cancelled or declined at the payment gateway.";

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="items-center text-center">
        <span
          className={cn(
            "mb-2 flex size-12 items-center justify-center rounded-xl",
            showSuccessFace
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {showSuccessFace ? (
            <CircleCheckIcon className="size-6" aria-hidden="true" />
          ) : (
            <OctagonXIcon className="size-6" aria-hidden="true" />
          )}
        </span>

        <CardTitle className="text-xl">{headline}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}

        {payment ? (
          <dl className="divide-y rounded-lg border">
            <DetailRow
              label="Status"
              value={<StatusBadge status={payment.status} />}
            />
            <DetailRow
              label="Amount"
              value={formatCurrency(Number(payment.amount))}
            />
            <DetailRow label="Type" value={payment.type} />
            <DetailRow label="Invoice" value={payment.invoiceId} />
            <DetailRow
              label="Transaction reference"
              value={payment.transactionReference}
            />
            <DetailRow label="Paid at" value={formatDate(payment.paidAt)} />
            <DetailRow label="Failure reason" value={payment.failureReason} />
            <DetailRow
              label="Last updated"
              value={formatDate(payment.updatedAt)}
            />
          </dl>
        ) : null}

        {!payment && !error && !reference && !note ? (
          <p className="text-sm text-muted-foreground">
            No transaction reference was included in the redirect, so there is
            no gateway record to show here.
          </p>
        ) : null}

        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href={checkHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "no-underline",
            )}
          >
            Check again
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "no-underline",
            )}
          >
            Back to home
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
