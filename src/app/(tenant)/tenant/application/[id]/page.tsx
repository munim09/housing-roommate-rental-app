import { notFound } from "next/navigation";
import { getTenantApplication } from "@/api/tenant.api";

export default async function ApplicationDetailPage({
  params,
}: PageProps<"/tenant/application/[id]">) {
  const { id } = await params;
  const res = await getTenantApplication(id).catch(() => null as any);
  if (!res?.success || !res.data) notFound();

  const app = res.data;
  const stay = app.stay || app.stays?.[0] || null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Application Details</h1>
      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-medium">{app.advertisement?.title || "Application"}</p>
        <p className="text-sm text-muted-foreground">Application Status: {app.status}</p>
        {stay && (
          <div className="mt-2 pl-2 border-l space-y-1">
            <p className="font-medium">Stay {stay.id}</p>
            <p className="text-sm text-muted-foreground">Stay Status: {stay.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}