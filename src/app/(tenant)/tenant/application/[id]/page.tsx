import { notFound } from "next/navigation";
import { getTenantApplication } from "@/api/tenant.api";
import { CancelApplication } from "./page.client";

export default async function ApplicationDetailPage({
  params,
}: PageProps<"/tenant/application/[id]">) {
  const { id } = await params;
  const res = await getTenantApplication(id).catch(() => null as any);
  if (!res?.success || !res.data) notFound();

  const app = res.data;
  const stay = app.stay || app.stays?.[0] || null;
  const stayStatus = stay?.status?.toUpperCase();
  const showRentInvoices = stayStatus === "WAITING_FOR_PAYMENT" || stayStatus === "CONFIRMED";
  const showUtilityInvoices = true;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Application Details</h1>
      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-medium">{app.advertisement?.title || "Application"}</p>
        <p className="text-sm text-muted-foreground">Application Status: {app.status}</p>
        {app.advertisement && (
          <div className="mt-2 space-y-1 text-sm">
            <p>Description: {app.advertisement.description}</p>
            <p>Rent: {app.advertisement.monthlyRent}</p>
          </div>
        )}
        {stay && (
          <div className="mt-2 pl-2 border-l space-y-1">
            <p className="font-medium">Stay {stay.id}</p>
            <p className="text-sm text-muted-foreground">Stay Status: {stay.status}</p>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <CancelApplication app={app} stay={stay} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Rent Invoices</h2>
          <p className="text-sm text-muted-foreground">
            {showRentInvoices ? "Pending rent invoices are visible (payment not implemented)" : "Inactive - no rent invoice actions available"}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Utility Invoices</h2>
          <p className="text-sm text-muted-foreground">
            {showUtilityInvoices ? "All pending utility invoices are open (payment not implemented)" : "No pending utility invoices shown"}
          </p>
        </div>
      </div>
    </div>
  );
}
