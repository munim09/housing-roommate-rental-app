import {
  ArrowLeftIcon,
  Building2Icon,
  DoorOpenIcon,
  HomeIcon,
  MapPinIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ListingApplyPanel } from "@/components/modules/listings/listing-apply-panel";
import { ListingGallery } from "@/components/modules/listings/listing-gallery";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAreaSqFt, formatCurrency, formatDate } from "@/lib/format";
import {
  type AvailableAdvertisementDetail,
  RENTAL_TYPE_LABELS,
  type UserRole,
} from "@/types";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="grid gap-1">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2.5 last:border-b-0">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-pretty">{children}</dd>
    </div>
  );
}

function StayWindow({
  stayFrom,
  stayTo,
  availableFrom,
  availableTo,
}: {
  stayFrom?: string | null;
  stayTo?: string | null;
  availableFrom: string;
  availableTo: string;
}) {
  const hasStay = Boolean(stayFrom && stayTo);
  const days =
    hasStay && stayFrom && stayTo
      ? Math.round(
          (Date.parse(stayTo) - Date.parse(stayFrom)) / (24 * 60 * 60 * 1000),
        )
      : null;

  return (
    <section className="rounded-2xl border bg-primary/5 p-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Move-in
            </span>
            <span className="font-semibold tabular-nums">
              {hasStay ? formatDate(stayFrom) : "Add your dates"}
            </span>
          </div>
          <div className="grid gap-1">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Move-out
            </span>
            <span className="font-semibold tabular-nums">
              {hasStay ? formatDate(stayTo) : "Add your dates"}
            </span>
          </div>
        </div>

        <div className="grid gap-1 sm:text-right">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {hasStay ? "Duration" : "Listing availability"}
          </span>
          <span className="text-sm font-medium">
            {hasStay && days !== null
              ? `${days} ${days === 1 ? "day" : "days"}`
              : `${formatDate(availableFrom)} – ${formatDate(availableTo)}`}
          </span>
        </div>
      </div>
    </section>
  );
}

export function ListingDetail({
  listing,
  stayFrom,
  stayTo,
  backHref,
  returnTo,
  viewer,
}: {
  listing: AvailableAdvertisementDetail;
  stayFrom?: string | null;
  stayTo?: string | null;
  backHref: string;
  returnTo: string;
  viewer: { role: UserRole; name: string } | null;
}) {
  const flat = listing.flat ?? null;
  const room = listing.room ?? null;
  const property = listing.flat?.property ?? listing.property ?? null;
  const isEntireFlat = listing.rentalType === "PRIMARY_ENTIRE_FLAT";
  const showRoomCard = !isEntireFlat && room !== null;
  const rooms = flat?.rooms ?? [];

  // For a room listing the room photos matter first; the flat ones fill in.
  const galleryImages = (
    isEntireFlat
      ? (flat?.images ?? [])
      : [...(room?.images ?? []), ...(flat?.images ?? [])]
  ).filter(
    (image, index, all) =>
      all.findIndex((candidate) => candidate.id === image.id) === index,
  );

  const address = [
    property?.address,
    property?.area?.name,
    property?.area?.city?.name,
  ]
    .filter(Boolean)
    .join(", ");

  const advertiser = listing.createdBy ?? null;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="grid gap-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ms-2 w-fit"
          nativeButton={false}
          render={<Link href={backHref} />}
        >
          <ArrowLeftIcon aria-hidden="true" />
          Back to results
        </Button>

        <ListingGallery images={galleryImages} title={listing.title} />

        <header className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{RENTAL_TYPE_LABELS[listing.rentalType]}</Badge>
            <Badge variant="outline">
              Available {formatDate(listing.availableFrom)} –{" "}
              {formatDate(listing.availableTo)}
            </Badge>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {listing.title}
          </h1>

          {address ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="size-4 shrink-0" aria-hidden="true" />
              {address}
            </p>
          ) : null}
        </header>

        <StayWindow
          stayFrom={stayFrom}
          stayTo={stayTo}
          availableFrom={listing.availableFrom}
          availableTo={listing.availableTo}
        />

        {listing.description ? (
          <Section title="About this listing">
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {listing.description}
            </p>
          </Section>
        ) : null}

        <Section title="Advertisement details">
          <dl>
            <Row label="Monthly rent">
              {formatCurrency(Number(listing.monthlyRent))}
            </Row>
            <Row label="Rental type">
              {RENTAL_TYPE_LABELS[listing.rentalType]}
            </Row>
            <Row label="Available from">
              {formatDate(listing.availableFrom)}
            </Row>
            <Row label="Available to">{formatDate(listing.availableTo)}</Row>
            <Row label="Status">
              <StatusBadge status={String(listing.status).toUpperCase()} />
            </Row>
            <Row label="Listed on">
              {formatDate(listing.publishedAt ?? listing.createdAt)}
            </Row>
            <Row label="Listed by">
              {advertiser ? (
                <span className="grid gap-0.5">
                  <span>{advertiser.name ?? "Listing owner"}</span>
                  {advertiser.email ? (
                    <a
                      href={`mailto:${advertiser.email}`}
                      className="font-normal text-primary underline-offset-4 hover:underline"
                    >
                      {advertiser.email}
                    </a>
                  ) : null}
                  {advertiser.phone ? (
                    <a
                      href={`tel:${advertiser.phone}`}
                      className="font-normal text-primary underline-offset-4 hover:underline"
                    >
                      {advertiser.phone}
                    </a>
                  ) : null}
                </span>
              ) : (
                "—"
              )}
            </Row>
          </dl>
        </Section>

        {showRoomCard && room ? (
          <Section
            title="Room details"
            description="The room this advertisement rents out."
          >
            <dl>
              <Row label="Room number">{room.roomNumber ?? "—"}</Row>
              <Row label="Room name">{room.name ?? "—"}</Row>
              <Row label="Area">{formatAreaSqFt(room.areaSqFt)}</Row>
              <Row label="Status">
                <StatusBadge
                  status={String(room.status ?? "ACTIVE").toUpperCase()}
                />
              </Row>
            </dl>
            {room.description ? (
              <p className="mt-3 border-t pt-3 text-sm text-muted-foreground text-pretty">
                {room.description}
              </p>
            ) : null}
          </Section>
        ) : null}

        {flat ? (
          <Section
            title={isEntireFlat ? "Flat details" : "Flat this room is in"}
            description={
              isEntireFlat
                ? "The whole flat offered by this advertisement."
                : "Context for the room: the flat it belongs to."
            }
          >
            <dl>
              <Row label="Flat number">{flat.flatNumber ?? "—"}</Row>
              <Row label="Floor">{flat.floorNumber ?? "—"}</Row>
              <Row label="Bedrooms">{flat.bedrooms ?? "—"}</Row>
              <Row label="Bathrooms">{flat.bathrooms ?? "—"}</Row>
              <Row label="Area">{formatAreaSqFt(flat.areaSqFt)}</Row>
            </dl>

            {flat.description ? (
              <p className="mt-3 border-t pt-3 text-sm text-muted-foreground text-pretty">
                {flat.description}
              </p>
            ) : null}

            {isEntireFlat && rooms.length > 0 ? (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium">Rooms inside this flat</h3>
                <ul className="mt-2 grid gap-2">
                  {rooms.map((innerRoom) => (
                    <li
                      key={innerRoom.id}
                      className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <span className="grid gap-0.5">
                        <span className="text-sm font-medium">
                          {innerRoom.name ?? "Room"}{" "}
                          <span className="font-normal text-muted-foreground">
                            ({innerRoom.roomNumber ?? "—"})
                          </span>
                        </span>
                        {innerRoom.description ? (
                          <span className="text-xs text-muted-foreground">
                            {innerRoom.description}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatAreaSqFt(innerRoom.areaSqFt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>
        ) : null}

        {property ? (
          <Section title="Property" description={property.name}>
            <dl>
              <Row label="Address">{property.address ?? "—"}</Row>
              <Row label="Area">{property.area?.name ?? "—"}</Row>
              <Row label="City">{property.area?.city?.name ?? "—"}</Row>
              <Row label="Type">{property.type ?? "—"}</Row>
              <Row label="Postal code">{property.postalCode ?? "—"}</Row>
            </dl>
          </Section>
        ) : null}
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HomeIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{listing.title}</span>
        </div>

        <ListingApplyPanel
          advertisementId={listing.id}
          title={listing.title}
          rentalType={listing.rentalType}
          monthlyRent={Number(listing.monthlyRent)}
          availableFrom={listing.availableFrom}
          availableTo={listing.availableTo}
          stayFrom={stayFrom}
          stayTo={stayTo}
          viewerRole={viewer?.role ?? null}
          viewerName={viewer?.name}
          returnTo={returnTo}
        />

        <div className="flex items-start gap-3 rounded-2xl border p-4 text-sm text-muted-foreground">
          <Building2Icon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p className="text-pretty">
            {isEntireFlat
              ? "This advertisement lets out the entire flat, so the flat details above are what you are renting."
              : "This advertisement lets out a single room; the flat details above are shared with the rest of the household."}
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border p-4 text-sm text-muted-foreground">
          <DoorOpenIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="text-pretty">
            Applying does not charge anything. The owner approves the request
            and the stay record is created from there.
          </p>
        </div>
      </aside>
    </div>
  );
}
