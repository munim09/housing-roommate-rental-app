import { QuoteIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FIELD_SLOTS = ["area", "from", "to", "type"] as const;
const STAT_SLOTS = ["rooms", "volume", "time", "rating"] as const;
const CARD_SLOTS = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
] as const;
const TRUST_SLOTS = ["brokerage", "roommates", "payments"] as const;
const STEP_SLOTS = ["search", "viewing", "apply", "pay"] as const;
const STAR_SLOTS = ["one", "two", "three", "four", "five"] as const;

function SiteHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-20" />
        <div className="ms-auto flex items-center gap-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>
    </div>
  );
}

/** Matches the hero/search card shape used on `/` and `/listings`. */
export function SearchFormSkeleton() {
  return (
    <div className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
      {FIELD_SLOTS.map((slot) => (
        <div key={slot} className="grid gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function StatStripSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      {STAT_SLOTS.map((slot) => (
        <div key={slot} className="grid gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

export function ListingGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {CARD_SLOTS.map((slot) => (
        <div
          key={slot}
          className="grid gap-0 overflow-hidden rounded-xl border pt-0"
        >
          <Skeleton className="aspect-16/10 w-full rounded-none" />
          <div className="grid gap-3 p-5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaginationSkeleton() {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t pt-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export function TrustPointsSkeleton() {
  return (
    <div className="flex flex-wrap gap-6">
      {TRUST_SLOTS.map((slot) => (
        <Skeleton key={slot} className="h-4 w-32" />
      ))}
    </div>
  );
}

export function StepsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {STEP_SLOTS.map((slot) => (
        <div key={slot} className="grid gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-5" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Real content, not a placeholder — the 5-star row is not loading data. */
export function RatingStars() {
  return (
    <div
      role="img"
      aria-label="Rated 5 out of 5"
      className="flex gap-0.5 text-primary"
    >
      {STAR_SLOTS.map((slot) => (
        <QuoteIcon
          key={slot}
          className="size-4 fill-current"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export { SiteHeaderSkeleton };
