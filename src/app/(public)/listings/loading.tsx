import {
  ListingGridSkeleton,
  PaginationSkeleton,
  SearchFormSkeleton,
  SiteHeaderSkeleton,
} from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingsLoading() {
  return (
    <div className="flex min-h-full flex-col" aria-busy="true">
      <span className="sr-only">Loading available listings</span>

      <SiteHeaderSkeleton />

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10 sm:px-6 lg:py-12">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-8 w-96 max-w-full" />
            <SearchFormSkeleton />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <Skeleton className="h-4 w-52" />
          <div className="mt-5">
            <ListingGridSkeleton />
          </div>
          <PaginationSkeleton />
        </section>
      </main>
    </div>
  );
}
