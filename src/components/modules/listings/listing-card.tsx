import { BathIcon, BedDoubleIcon, MapPinIcon, RulerIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type AvailableAdvertisement, RENTAL_TYPE_LABELS } from "@/types";

const BDT = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

function formatRent(value: number) {
  return BDT.format(value).replace("BDT", "৳");
}

function formatRange(from: string, to: string) {
  const start = new Date(from);
  const end = new Date(to);

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  const startLabel = start.toLocaleDateString("en-GB", {
    day: "numeric",
    ...(sameMonth ? {} : { month: "short" }),
  });

  const endLabel = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

export function ListingCard({
  listing,
  detailSearch = "",
}: {
  listing: AvailableAdvertisement;
  /** Query string carrying the search (area + dates) to the detail page. */
  detailSearch?: string;
}) {
  const size = listing.flat ?? listing.room;
  const location = [listing.property?.area?.name, listing.property?.name]
    .filter(Boolean)
    .join(", ");
  const photo = listing.images?.find((src) => Boolean(src));
  const detailHref = `/listings/${listing.id}${detailSearch ? `?${detailSearch}` : ""}`;

  return (
    <Card className="relative overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-muted">
            <BedDoubleIcon className="size-8 text-muted-foreground/60" />
          </div>
        )}

        <Badge className="absolute top-3 start-3">
          {RENTAL_TYPE_LABELS[listing.rentalType]}
        </Badge>
      </div>

      <CardContent className="grid gap-3 p-5">
        <div className="grid gap-1">
          <h3 className="line-clamp-1 font-semibold tracking-tight">
            <Link
              href={detailHref}
              className="after:absolute after:inset-0 focus-visible:underline"
            >
              {listing.title}
            </Link>
          </h3>
          {location ? (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{location}</span>
            </p>
          ) : null}
        </div>

        {size ? (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {size.bedrooms ? (
              <li className="flex items-center gap-1">
                <BedDoubleIcon className="size-3.5" aria-hidden="true" />
                {size.bedrooms} bed
              </li>
            ) : null}
            {size.bathrooms ? (
              <li className="flex items-center gap-1">
                <BathIcon className="size-3.5" aria-hidden="true" />
                {size.bathrooms} bath
              </li>
            ) : null}
            {size.areaSqFt ? (
              <li className="flex items-center gap-1">
                <RulerIcon className="size-3.5" aria-hidden="true" />
                {size.areaSqFt} sq ft
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-3">
          <div className="grid gap-0.5">
            <span className="text-lg font-semibold tracking-tight">
              {formatRent(listing.monthlyRent)}
            </span>
            <span className="text-xs text-muted-foreground">per month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatRange(listing.availableFrom, listing.availableTo)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
