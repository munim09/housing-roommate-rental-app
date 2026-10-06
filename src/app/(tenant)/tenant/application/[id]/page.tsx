import { notFound } from "next/navigation";
import { getInvoicesByStay } from "@/api/invoice.api";
import { getTenantApplication } from "@/api/tenant.api";
import { InvoiceSection } from "@/components/modules/tenant/invoice-section";
import { TenantNav } from "@/components/modules/tenant/tenant-nav";
import type { Invoice } from "@/types";
import { CancelApplication } from "./page.client";

export default async function ApplicationDetailPage({
  params,
}: PageProps<"/tenant/application/[id]">) {
  const { id } = await params;
  const res = await getTenantApplication(id);
  const data: any = res?.data ?? res;
  if (!data) notFound();

  const app = data;
  const stay = app.stay || app.stays?.[0] || null;
  const stayStatus = stay?.status?.toUpperCase();
  const showRentInvoices =
    stayStatus === "WAITING_FOR_PAYMENT" || stayStatus === "CONFIRMED";

  // Invoices hang off a stay, and the backend answers 404 for an application
  // that has none yet (rejected, withdrawn, still pending review).
  const invoiceRes = stay?.id
    ? await getInvoicesByStay({ stayId: stay.id })
    : null;
  const invoices: Invoice[] = invoiceRes?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Application Details
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
            Stay status, invoices and payment history for this application.
          </p>
        </div>

        <TenantNav
          currentLabel={app.advertisement?.title || "Application"}
          className="w-fit"
        />
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-medium">
          {app.advertisement?.title || "Application"}
        </p>
        <p className="text-sm text-muted-foreground">
          Application Status: {app.status}
        </p>
        {app.advertisement && (
          <div className="mt-2 space-y-1 text-sm">
            <p>Description: {app.advertisement.description}</p>
            <p>Rent: {app.advertisement.monthlyRent}</p>
          </div>
        )}
        {stay && (
          <div className="mt-2 pl-2 border-l space-y-1">
            <p className="font-medium">Stay {stay.id}</p>
            <p className="text-sm text-muted-foreground">
              Stay Status: {stay.status}
            </p>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <CancelApplication app={app} stay={stay} />
        </div>
      </div>

      <div className="space-y-8">
        {showRentInvoices ? (
          <InvoiceSection invoices={invoices} type="RENT" />
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Rent invoices
            </h2>
            <p className="text-sm text-muted-foreground">
              Rent invoices appear once the stay is approved and waiting for
              payment.
            </p>
          </div>
        )}

        <InvoiceSection invoices={invoices} type="UTILITY" />
      </div>
    </div>
  );
}
