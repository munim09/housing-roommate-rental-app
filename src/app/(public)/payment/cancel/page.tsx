import type { Metadata } from "next";
import { loadPaymentStatus } from "@/api/payment.api";
import { PaymentStatusCard } from "@/components/modules/payment/payment-status-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description:
    "The SSLCommerz payment for this Dwellio invoice was cancelled or declined, with the current gateway status.",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The cancel leg of the gateway redirect. Public, and tolerant of both shapes
 * a backend can use: a bare `/payment/cancel` (no transaction to report on) or
 * `/payment/cancel?tranId=…` carrying the reference to look up.
 */
export default async function PaymentCancelPage({
  searchParams,
}: PageProps<"/payment/cancel">) {
  const params = await searchParams;
  const reference =
    firstValue(params.tranId) ??
    firstValue(params.transactionReference) ??
    null;

  const { payment, error } = reference
    ? await loadPaymentStatus(reference)
    : { payment: null, error: null };

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <PaymentStatusCard
          intent="cancel"
          reference={reference}
          payment={payment}
          error={error}
          checkHref={
            reference
              ? `/payment/cancel?tranId=${encodeURIComponent(reference)}`
              : "/payment/cancel"
          }
        />
      </main>

      <SiteFooter />
    </div>
  );
}
