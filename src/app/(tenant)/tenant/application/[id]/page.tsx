import { notFound } from "next/navigation";
import { getInvoicesByStay } from "@/api/invoice.api";
import { getTenantApplication } from "@/api/tenant.api";
import { InvoiceSection } from "@/components/modules/tenant/invoice-section";
import { MaintenanceSection } from "@/components/modules/tenant/maintenance-section";
import { TenantNav } from "@/components/modules/tenant/tenant-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
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
  // A stay starts once its rent is paid (`CONFIRMED`); only then does the
  // backend accept maintenance requests against it.
  const stayStarted = stayStatus === "CONFIRMED";

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
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="font-medium">
            {app.advertisement?.title || "Application"}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Application status
            </span>
            <StatusBadge status={(app.status ?? "").toUpperCase()} />
          </div>
        </div>

        {app.advertisement ? (
          <div className="space-y-1 text-sm">
            {app.advertisement.description ? (
              <p className="text-pretty text-muted-foreground">
                {app.advertisement.description}
              </p>
            ) : null}
            <p>
              Rent:{" "}
              {app.advertisement.monthlyRent != null
                ? formatCurrency(Number(app.advertisement.monthlyRent))
                : "—"}
            </p>
          </div>
        ) : null}

        {stay ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Stay record</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(stay.startDate)} → {formatDate(stay.endDate)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Stay status
              </span>
              <StatusBadge status={(stay.status ?? "").toUpperCase()} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No stay record yet — one is created when the application is
            approved.
          </p>
        )}

        <div className="flex gap-2 pt-1">
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

        {stay?.id ? (
          <MaintenanceSection stayId={stay.id} canCreate={stayStarted} />
        ) : null}
      </div>
    </div>
  );
}
