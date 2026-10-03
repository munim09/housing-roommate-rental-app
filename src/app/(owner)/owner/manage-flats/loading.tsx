import { Skeleton } from "@/components/ui/skeleton";

const STAT_SLOTS = ["flats", "rooms", "awaiting", "active"] as const;

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

/** Mirrors the page's shape: heading, four stats, then the flat table. */
export default function ManageFlatsLoading() {
  return (
    <div className="flex min-h-full flex-col" aria-busy="true">
      <span className="sr-only">Loading your flats</span>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        <Skeleton className="mt-4 h-9 w-64" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_SLOTS.map((slot) => (
            <Skeleton key={slot} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-full sm:w-64" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border p-5">
          <Skeleton className="h-5 w-24" />
          {ROW_SLOTS.map((slot) => (
            <Skeleton key={slot} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
