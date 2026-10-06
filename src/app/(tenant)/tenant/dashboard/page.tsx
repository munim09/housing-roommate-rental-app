import { TenantNav } from "@/components/modules/tenant/tenant-nav";
import { TenantDashboard } from "./page.client";

export default function TenantDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Tenant Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
            Your applications, active stays and rent invoices in one place. Open
            an application to see its invoices and pay online.
          </p>
        </div>

        <TenantNav activeHref="/tenant/dashboard" className="w-fit" />
      </div>

      <TenantDashboard />
    </div>
  );
}
