import { Skeleton } from "@/components/ui/skeleton";

export default function ManageAdvertisementLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-10 w-fit" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-40" />
        </div>

        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-3 rounded-xl border p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
