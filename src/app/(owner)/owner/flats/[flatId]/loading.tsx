import { Skeleton } from "@/components/ui/skeleton";

const STAT_SLOTS = [
  "beds",
  "baths",
  "area",
  "floor",
  "rooms",
  "photos",
] as const;

const CARD_SLOTS = ["one", "two", "three"] as const;

/** Mirrors the page's shape: back link, heading, then photo card plus rooms. */
export default async function FlatDetailsLoading({
  params,
}: PageProps<"/owner/flats/[flatId]">) {
  // Read the params so the boundary is awaited the same way the page is; the
  // flat number is not known yet, hence the generic heading skeleton.
  await params;

  return (
    <div className="flex min-h-full flex-col" aria-busy="true">
      <span className="sr-only">Loading this flat</span>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-9 w-64" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-4 h-9 w-64" />

        <div className="mt-6 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-7" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <div className="grid gap-4 rounded-xl border p-4">
            <Skeleton className="aspect-4/3 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              {STAT_SLOTS.map((slot) => (
                <Skeleton key={slot} className="h-10 w-full" />
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-xl border p-5">
            <Skeleton className="h-5 w-40" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {CARD_SLOTS.map((slot) => (
                <Skeleton key={slot} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
