import type { Metadata } from "next";
import { loadPaymentStatus } from "@/api/payment.api";
import { PaymentStatusCard } from "@/components/modules/payment/payment-status-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description:
    "Current SSLCommerz gateway status for a cancelled or declined Dwellio payment.",
};

/** Transaction references are the UUIDs the backend hands to the gateway. */
const REFERENCE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Cancel redirect with the transaction in the path
 * (`/payment/cancel/:transactionReference`). A segment that is not a reference
 * — `failed`, for instance — is reported as a reason instead of being looked
 * up, so the visitor never sees a "payment not found" for a status word.
 */
export default async function PaymentCancelDetailPage({
  params,
}: PageProps<"/payment/cancel/[transactionReference]">) {
  const { transactionReference } = await params;
  const isReference = REFERENCE_PATTERN.test(transactionReference);

  const { payment, error } = isReference
    ? await loadPaymentStatus(transactionReference)
    : { payment: null, error: null };

  const note = isReference
    ? null
    : `The payment gateway returned the status "${transactionReference}" instead of a transaction reference, so there is no gateway record to display.`;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <PaymentStatusCard
          intent="cancel"
          reference={isReference ? transactionReference : null}
          payment={payment}
          error={error}
          note={note}
          checkHref={`/payment/cancel/${encodeURIComponent(transactionReference)}`}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
