import { Skeleton } from "@/components/ui/skeleton";

export default function TenantDashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-10 w-fit" />
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
