import { SiteHeaderSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingDetailLoading() {
  return (
    <div className="flex min-h-full flex-col" aria-busy="true">
      <span className="sr-only">Loading listing details</span>

      <SiteHeaderSkeleton />

      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="grid gap-6">
            <Skeleton className="h-8 w-36" />

            <div className="grid gap-3">
              <Skeleton className="aspect-16/10 w-full rounded-2xl" />
              <div className="flex gap-2">
                {["one", "two", "three", "four", "five"].map((id) => (
                  <Skeleton key={id} className="size-16 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-52 rounded-full" />
              </div>
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            <Skeleton className="h-28 w-full rounded-2xl" />

            <div className="grid gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>

            <div className="grid gap-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>

          <aside className="grid gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </aside>
        </div>
      </main>
    </div>
  );
}
