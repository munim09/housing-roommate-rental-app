import {
  SearchFormSkeleton,
  SiteHeaderSkeleton,
  StatStripSkeleton,
  StepsSkeleton,
  TrustPointsSkeleton,
} from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex min-h-full flex-col" aria-busy="true">
      <span className="sr-only">Loading the home page</span>

      <SiteHeaderSkeleton />

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:py-20">
            <Skeleton className="h-6 w-56 rounded-full" />
            <Skeleton className="h-12 w-full max-w-3xl sm:h-14" />
            <Skeleton className="h-5 w-full max-w-2xl" />

            <SearchFormSkeleton />

            <TrustPointsSkeleton />
          </div>
        </section>

        <section className="border-b">
          <StatStripSkeleton />
        </section>

        <section className="border-b bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:py-20">
            <Skeleton className="h-8 w-80 max-w-full" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <StepsSkeleton />
          </div>
        </section>
      </main>
    </div>
  );
}
