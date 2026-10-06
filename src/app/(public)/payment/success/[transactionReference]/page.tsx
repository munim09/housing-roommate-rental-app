import type { Metadata } from "next";
import { loadPaymentStatus } from "@/api/payment.api";
import { PaymentStatusCard } from "@/components/modules/payment/payment-status-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Payment successful",
  description:
    "SSLCommerz payment result for a Dwellio invoice: amount, transaction reference and the final gateway status.",
};

/**
 * Where SSLCommerz sends the browser after a paid transaction. Public on
 * purpose — the redirect arrives from the gateway, and the status itself is
 * re-read from `GET /payments/check/:transactionReference` rather than trusted
 * from the URL.
 */
export default async function PaymentSuccessPage({
  params,
}: PageProps<"/payment/success/[transactionReference]">) {
  const { transactionReference } = await params;
  const { payment, error } = await loadPaymentStatus(transactionReference);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <PaymentStatusCard
          intent="success"
          reference={transactionReference}
          payment={payment}
          error={error}
          checkHref={`/payment/success/${encodeURIComponent(transactionReference)}`}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
