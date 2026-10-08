import { Skeleton } from "@/components/ui/skeleton";

export default function ManageMaintenanceLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-10 w-fit" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-3 rounded-xl border p-5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-10 w-fit" />
          <Skeleton className="h-9 w-64" />
        </div>

        <div className="space-y-3 rounded-xl border p-5">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="ml-auto h-7 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
