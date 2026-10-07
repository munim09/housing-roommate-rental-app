import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAvailableAdvertisement } from "@/api";
import { ListingDetail } from "@/components/modules/listings/listing-detail";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { toApiError } from "@/lib/api-client";
import { getSessionClaims } from "@/lib/server-session";
import type { AvailableAdvertisementDetail } from "@/types";

export const metadata: Metadata = {
  title: "Listing details",
  description:
    "Review the flat, the room, the requested dates and apply for a stay.",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Search keys carried over from `/listings` so "back to results" restores it. */
const SEARCH_KEYS = ["areaId", "from", "to", "area", "type", "page"] as const;

/** Same default stay length the search form opens with. */
const DEFAULT_STAY_DAYS = 30;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isoDay(value: string | string[] | undefined): string | null {
  const raw = firstValue(value);
  if (!raw) return null;

  const day = raw.slice(0, 10);
  return ISO_DATE.test(day) ? day : null;
}

function todayDay() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(day: string, days: number) {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function clampDay(day: string, min: string, max: string) {
  if (day < min) return min;
  return day > max ? max : day;
}

async function fetchListing(id: string): Promise<AvailableAdvertisementDetail> {
  try {
    const response = await getAvailableAdvertisement(id);
    if (!response?.data) notFound();

    return response.data;
  } catch (error) {
    // A withdrawn or unknown advertisement is a 404 from this public route.
    if (toApiError(error).statusCode === 404) notFound();
    throw error;
  }
}

function areaOf(listing: AvailableAdvertisementDetail) {
  const area = listing.flat?.property?.area ?? listing.property?.area ?? null;
  if (!area) return null;

  // Same `Area, City` label the search box puts in the `area` query value.
  return {
    id: area.id,
    label: area.city?.name ? `${area.name}, ${area.city.name}` : area.name,
  };
}

/**
 * The stay the URL pins down: the requested days when they are still usable,
 * otherwise today clamped into the listing's availability window plus a
 * 30-day stay. Keeping these in the URL is what lets a guest who bounced to
 * `/login?from=…` come back to exactly this search.
 */
function resolveStay(
  from: string | null,
  to: string | null,
  listing: AvailableAdvertisementDetail,
) {
  const availableFrom = isoDay(listing.availableFrom) ?? todayDay();
  const availableTo = isoDay(listing.availableTo) ?? availableFrom;
  const windowEnd = availableTo < availableFrom ? availableFrom : availableTo;

  const today = clampDay(todayDay(), availableFrom, windowEnd);
  const start = from && from >= today && from <= windowEnd ? from : today;
  const end =
    to && to >= start && to <= windowEnd
      ? to
      : clampDay(addDays(start, DEFAULT_STAY_DAYS), start, windowEnd);

  return { start, end };
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: PageProps<"/listings/[id]">) {
  const { id } = await params;
  const sp = await searchParams;

  const [listing, claims] = await Promise.all([
    fetchListing(id),
    getSessionClaims(),
  ]);

  const search = new URLSearchParams();
  for (const key of SEARCH_KEYS) {
    const value = firstValue(sp[key]);
    if (value) search.set(key, value);
  }

  const requestedFrom = isoDay(sp.from);
  const requestedTo = isoDay(sp.to);
  const { start, end } = resolveStay(requestedFrom, requestedTo, listing);
  const area = areaOf(listing);

  // Filled in for links even on a bare URL, so "back to results" and the
  // login return trip keep the area context.
  if (!search.get("areaId") && area) search.set("areaId", area.id);
  if (!search.get("area") && area) search.set("area", area.label);

  // Every copy of this URL carries the stay dates. A URL without them (or
  // with a stale range) is canonicalised once, so signing in and coming back
  // lands on exactly this stay.
  if (requestedFrom !== start || requestedTo !== end) {
    search.set("from", start);
    search.set("to", end);
    redirect(`/listings/${id}?${search.toString()}`);
  }

  const queryString = search.toString();
  const backHref = queryString ? `/listings?${queryString}` : "/listings";
  const returnTo = `/listings/${id}?${queryString}`;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <ListingDetail
          listing={listing}
          stayFrom={start}
          stayTo={end}
          backHref={backHref}
          returnTo={returnTo}
          viewer={claims ? { role: claims.role, name: claims.name } : null}
        />
      </main>

      <SiteFooter />
    </>
  );
}
