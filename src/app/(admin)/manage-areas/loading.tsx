import { Skeleton } from "@/components/ui/skeleton";

const STAT_SLOTS = ["cities", "areas", "inScope", "pageSize"] as const;

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

export default function ManageAreasLoading() {
  return (
    <div className="flex min-h-full flex-col" aria-busy="true">
      <span className="sr-only">Loading cities and areas</span>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />

        <div className="mt-6 grid gap-2 rounded-xl border p-1 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_SLOTS.map((slot) => (
            <Skeleton key={slot} className="h-9 w-full" />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 rounded-xl border bg-muted/40 p-1">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="h-9 w-full sm:w-64" />
        </div>

        <div className="mt-6 grid gap-3 rounded-xl border p-5">
          <Skeleton className="h-5 w-32" />
          {ROW_SLOTS.map((slot) => (
            <Skeleton key={slot} className="h-11 w-full" />
          ))}
          <div className="flex items-center justify-between border-t pt-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
