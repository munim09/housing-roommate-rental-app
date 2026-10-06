import { SiteHeaderSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const ROW_SLOTS = ["one", "two", "three", "four"] as const;

/** Heading card shape used by both `/payment/success` and `/payment/cancel`. */
export default function PaymentStatusLoading() {
  return (
    <div className="flex min-h-full flex-col" aria-busy="true">
      <span className="sr-only">Loading payment status</span>

      <SiteHeaderSkeleton />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg space-y-4 rounded-xl border bg-card p-6">
          <Skeleton className="mx-auto size-12 rounded-xl" />
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto h-4 w-72" />

          <div className="space-y-2">
            {ROW_SLOTS.map((slot) => (
              <Skeleton key={slot} className="h-9 w-full" />
            ))}
          </div>

          <div className="flex justify-center gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </main>
    </div>
  );
}
