import { Skeleton } from "@/components/ui/skeleton";

const ROW_SLOTS = ["one", "two", "three", "four"] as const;

/** Mirrors the page: heading, application card, then the two invoice lists. */
export default function ApplicationDetailLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6"
      aria-busy="true"
    >
      <span className="sr-only">Loading application details</span>

      <Skeleton className="h-9 w-72" />

      <div className="space-y-3 rounded-lg border p-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-8 w-40" />
      </div>

      {[0, 1].map((section) => (
        <div key={section} className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full max-w-2xl" />
          <div className="space-y-3">
            {ROW_SLOTS.map((slot) => (
              <Skeleton key={slot} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
