import { Skeleton } from "@/components/ui/skeleton";

const STAT_SLOTS = ["properties", "flats", "stays", "collection"] as const;

const ROW_SLOTS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
] as const;

export default function OwnerDashboardLoading() {
  return (
    <div className="flex min-h-full flex-col" aria-busy="true">
      <span className="sr-only">Loading your dashboard</span>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />

        <div className="mt-6 grid gap-2 rounded-xl border p-1 sm:grid-cols-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_SLOTS.map((slot) => (
            <Skeleton key={slot} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        <div className="mt-6 grid gap-3 rounded-xl border p-5">
          <Skeleton className="h-5 w-40" />
          {ROW_SLOTS.map((slot) => (
            <Skeleton key={slot} className="h-11 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
