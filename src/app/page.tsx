import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CalendarCheckIcon,
  CheckIcon,
  FileSignatureIcon,
  HandshakeIcon,
  MapPinnedIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ListingSearchForm } from "@/components/form/listing-search-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseListingType } from "@/validation";

export const metadata: Metadata = {
  title: "Dwellio — Verified rooms and shared flats in Dhaka",
  description:
    "Search verified rooms and shared flats, book a viewing and apply in minutes. Dwellio handles rent, deposits and roommates for both sides through SSLCommerz.",
  openGraph: {
    title: "Dwellio — Find a room you will actually like coming home to",
    description:
      "Real photos, honest rent and verified roommates. Search by area, move-in date and rental type.",
    type: "website",
  },
};

const TRUST_POINTS = [
  "No brokerage",
  "Verified roommates",
  "Online rent & deposits",
] as const;

const STATS = [
  { value: "1,240+", label: "Verified rooms listed" },
  { value: "৳2.1B", label: "Rent processed safely" },
  { value: "18 min", label: "Median application time" },
  { value: "4.8/5", label: "Average tenant rating" },
] as const;

const STEPS = [
  {
    icon: MapPinnedIcon,
    title: "Search real rooms",
    body: "Pick an area, your move-in date and whether you want a whole flat, a single room or a room from a current tenant.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Book a viewing",
    body: "Choose a slot that suits you. The owner or manager confirms it inside the app.",
  },
  {
    icon: HandshakeIcon,
    title: "Apply in minutes",
    body: "Send your profile and preferred move-in date. Owners review and respond here.",
  },
  {
    icon: WalletIcon,
    title: "Pay rent online",
    body: "Deposits and monthly rent run through SSLCommerz, with a receipt for every payment.",
  },
] as const;

const OWNER_FEATURES = [
  "Reusable listing templates with rent, size and amenities",
  "Compare applicants side by side in one review queue",
  "Automated monthly invoices with overdue tracking",
  "Maintenance requests routed to the right manager",
] as const;

const PORTFOLIO = [
  { property: "Green Villa", occupied: 4, total: 4, fill: "w-full" },
  { property: "Rose Court", occupied: 3, total: 4, fill: "w-3/4" },
] as const;

const SAFETY = [
  {
    icon: WalletIcon,
    title: "Escrowed payments",
    body: "Rent and deposits are captured by SSLCommerz, never by hand.",
  },
  {
    icon: ShieldCheckIcon,
    title: "ID-verified people",
    body: "Owners, managers and tenants all pass identity checks.",
  },
  {
    icon: FileSignatureIcon,
    title: "Digital agreements",
    body: "Every tenancy has a signed record you can reopen anytime.",
  },
  // {
  //     icon: BuildingIcon,
  //     title: "Vetted properties",
  //     body: "Listings stay hidden until the owner's documents check out.",
  // },
] as const;

function PortfolioMeter({
  property,
  occupied,
  total,
  fill,
}: {
  property: string;
  occupied: number;
  total: number;
  fill: string;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{property}</span>
        <span className="text-muted-foreground">
          {occupied} / {total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full bg-primary ${fill}`} />
      </div>
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;

  // The area box is intentionally not prefetched: `GET /areas` only runs once
  // the consumer starts typing, so nothing is requested on first paint.
  const defaultValues = {
    areaId: typeof params.areaId === "string" ? params.areaId : "",
    areaLabel: typeof params.area === "string" ? params.area : "",
    from: typeof params.from === "string" ? params.from : "",
    to: typeof params.to === "string" ? params.to : "",
    type: parseListingType(params.type),
  };

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section
          id="search"
          className="relative scroll-mt-20 overflow-hidden border-b"
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="grid gap-8">
              <Badge variant="outline" className="w-fit gap-1.5 px-2.5 py-1">
                <BadgeCheckIcon aria-hidden="true" />
                Verified listings · Dhaka
              </Badge>

              <div className="grid gap-4">
                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Find a room you&rsquo;ll actually like coming home to.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground text-pretty lg:text-lg">
                  Dwellio brings tenants, owners and property managers into one
                  place. Real photos, honest rent, verified roommates, and rent
                  handled end to end through SSLCommerz.
                </p>
              </div>

              <ListingSearchForm defaultValues={defaultValues} />

              <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-1.5">
                    <CheckIcon
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="grid gap-1">
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-b bg-muted/40"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="grid gap-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Renting, without the back-and-forth
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Search, book a viewing, apply, pay. Everything after that is
                tracked in one dashboard.
              </p>
            </div>

            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="grid content-start gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border bg-background text-sm font-semibold">
                    {index + 1}
                  </span>
                  <step.icon
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold tracking-tight">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8">
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/" />}
              >
                Start your search
                <ArrowRightIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>

        {/* For owners */}
        {/* <section id="owners" className="scroll-mt-20">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
            <div className="grid gap-6">
              <Badge variant="outline" className="w-fit gap-1.5 px-2.5 py-1">
                <SparklesIcon aria-hidden="true" />
                For owners &amp; managers
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Fill your flats faster, and stop chasing rent.
              </h2>
              <p className="text-muted-foreground">
                List a property once, hand units to a manager, and let Dwellio
                handle viewings, applications, invoices and maintenance for you.
              </p>
              <ul className="grid gap-3">
                {OWNER_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <CheckIcon
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button nativeButton={false} render={<Link href="/register" />}>
                  List a property
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/owner/dashboard" />}
                >
                  See the owner view
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio snapshot</CardTitle>
                <CardDescription>
                  What an owner sees after a month on Dwellio.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Occupancy", value: "91%" },
                    {
                      label: "Collected",
                      value: "৳312,000",
                    },
                    {
                      label: "Open applications",
                      value: "4",
                    },
                    {
                      label: "Avg. days vacant",
                      value: "6 days",
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-xl font-semibold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {PORTFOLIO.map((row) => (
                  <PortfolioMeter key={row.property} {...row} />
                ))}
              </CardContent>
            </Card>
          </div>
        </section> */}

        {/* Safety */}
        <section id="safety" className="scroll-mt-20 border-y bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="grid gap-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Safe by default
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                Money moves through a regulated gateway, and both sides of every
                agreement are verified before you commit.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SAFETY.map((item) => (
                <Card key={item.title}>
                  <CardContent className="grid gap-2">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <h3 className="font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        {/* <section id="faq" className="scroll-mt-20">
                    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
                        <figure className="max-w-3xl rounded-2xl border bg-card p-6 shadow-sm">
                            <RatingStars />
                            <blockquote className="mt-4 text-lg font-medium leading-relaxed tracking-tight text-pretty">
                                &ldquo;I found a shared room in Dhanmondi on a
                                Tuesday, saw it on Thursday, and paid my deposit
                                from my phone. The agreement and every receipt
                                are right there in my dashboard.&rdquo;
                            </blockquote>
                            <figcaption className="mt-5 flex items-center gap-3">
                                <span
                                    className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                                    aria-hidden="true"
                                >
                                    SM
                                </span>
                                <span className="text-sm">
                                    <span className="block font-medium">
                                        Sz Munim
                                    </span>
                                    <span className="block text-muted-foreground">
                                        Tenant · Dhanmondi
                                    </span>
                                </span>
                            </figcaption>
                        </figure>
                    </div>
                </section> */}

        {/* CTA */}
        <section className="border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
            <h2 className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Ready to find your next place?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
              Create a free tenant account, or list your property and reach real
              tenants today.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                Get started
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/listings" />}
              >
                Browse listings
              </Button> */}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
