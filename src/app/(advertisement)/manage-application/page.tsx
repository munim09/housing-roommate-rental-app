import { ApplicationDetailSheet } from "@/components/modules/application/application-detail-sheet";
import { ApplicationRowActions } from "@/components/modules/application/application-row-actions";
import { ManagerNav } from "@/components/modules/manager/manager-nav";
import { OwnerNav } from "@/components/modules/owner/owner-nav";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSearch } from "@/components/shared/table-search";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authedFetchJson } from "@/lib/auth-fetched";
import { formatDate } from "@/lib/format";
import { getSessionClaims } from "@/lib/server-session";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  type ApiResponse,
  type Meta,
  type OwnerManagerApplication,
  RENTAL_TYPE_LABELS,
  type RentalType,
  type StayRecord,
} from "@/types";

export const metadata = {
  title: "Manage Applications",
};

/** The list call is paginated and has no status filter, so it is drained once. */
const FETCH_LIMIT = 50;
const MAX_PAGES = 20;

const DEFAULT_LIMIT = 10;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function rentalTypeLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return RENTAL_TYPE_LABELS[value as RentalType] ?? value.replaceAll("_", " ");
}

function rowsOf<T>(response: ApiResponse<T[]> | undefined): T[] {
  return Array.isArray(response?.data) ? response.data : [];
}

/**
 * Drains `GET /manager/applications`. Status, search and paging are applied
 * afterwards from the URL, which keeps the tab counts honest: they always
 * reflect the whole feed rather than the rows one status filter returned.
 */
async function fetchAllApplications(): Promise<OwnerManagerApplication[]> {
  const applications: OwnerManagerApplication[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await authedFetchJson<
      ApiResponse<OwnerManagerApplication[]>
    >(`/manager/applications?page=${page}&limit=${FETCH_LIMIT}`);

    applications.push(...rowsOf(response));

    const totalPages = Number(response?.meta?.totalPages ?? 1);
    if (!Number.isFinite(totalPages) || page >= totalPages) break;
  }

  return applications;
}

/** `GET /tenant/stays` — OWNER and MANAGER may read it, so the stay rows can be joined. */
async function fetchStays(): Promise<StayRecord[]> {
  const response =
    await authedFetchJson<ApiResponse<StayRecord[]>>("/tenant/stays");
  return rowsOf(response);
}

function matchesSearch(
  application: OwnerManagerApplication,
  search: string,
): boolean {
  if (!search) return true;

  const haystack = [
    application.applicant?.name,
    application.applicant?.email,
    application.applicant?.phone,
    application.advertisement?.title,
    application.note,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

export default async function ManageApplicationPage({
  searchParams,
}: PageProps<"/manage-application">) {
  const params = await searchParams;

  // Status tab, search term, paging and the open drawer are all read back out
  // of the URL, so every view is shareable and survives a refresh.
  const status = firstParam(params.status) ?? "";
  const search = (firstParam(params.search) ?? "").trim();
  const page = Math.max(1, Number(firstParam(params.page)) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(firstParam(params.limit)) || DEFAULT_LIMIT),
  );
  const applicationId = firstParam(params.applicationId) ?? "";

  const [claims, applications, stays] = await Promise.all([
    getSessionClaims(),
    fetchAllApplications(),
    fetchStays(),
  ]);
  const isManager = claims?.role === "MANAGER";

  const staysById = new Map(stays.map((stay) => [stay.id, stay]));
  const countBy = (value: string) =>
    applications.filter((application) => application.status === value).length;

  const matched = applications.filter(
    (application) =>
      (!status || application.status === status) &&
      matchesSearch(application, search),
  );

  const totalPages = Math.max(1, Math.ceil(matched.length / limit));
  const currentPage = Math.min(page, totalPages);
  const rows = matched.slice((currentPage - 1) * limit, currentPage * limit);
  const meta: Meta = {
    page: currentPage,
    limit,
    total: matched.length,
    totalPages,
  };

  const selected = applicationId
    ? (applications.find((application) => application.id === applicationId) ??
      null)
    : null;
  const selectedStay = selected?.stay
    ? (staysById.get(selected.stay.id) ?? null)
    : null;

  /** Keeps the active filters; `applicationId` is the one key this toggles. */
  const hrefWith = (key: string, value?: string) => {
    const next = new URLSearchParams();

    if (status) next.set("status", status);
    if (search) next.set("search", search);
    if (currentPage > 1) next.set("page", String(currentPage));
    if (limit !== DEFAULT_LIMIT) next.set("limit", String(limit));
    if (value) next.set(key, value);
    else next.delete(key);

    const query = next.toString();
    return query ? `/manage-application?${query}` : "/manage-application";
  };

  const listQuery = {
    status: status || undefined,
    search: search || undefined,
    limit: String(limit),
  };

  const columns: DataTableColumn<OwnerManagerApplication>[] = [
    {
      key: "applicant",
      header: "Applicant",
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-medium">
            {row.applicant?.name ?? "Unnamed applicant"}
          </p>
          {row.applicant?.email ? (
            <p className="truncate text-xs text-muted-foreground">
              {row.applicant.email}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "advertisement",
      header: "Listing",
      cell: (row) => (
        <div className="min-w-0 space-y-1">
          <p className="truncate">
            {row.advertisement?.title ?? "Listing unavailable"}
          </p>
          <Badge variant="secondary">{rentalTypeLabel(row.rentalType)}</Badge>
        </div>
      ),
    },
    {
      key: "requested",
      header: "Requested period",
      cell: (row) => (
        <span className="text-xs whitespace-nowrap">
          {formatDate(row.requestedStartDate)} →{" "}
          {formatDate(row.requestedEndDate)}
        </span>
      ),
    },
    {
      key: "stay",
      header: "Stay",
      cell: (row) =>
        row.stay ? (
          <StatusBadge status={row.stay.status} />
        ) : (
          <span className="text-xs text-muted-foreground">No stay</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-end",
      cell: (row) => (
        <ApplicationRowActions
          application={row}
          detailHref={hrefWith("applicationId", row.id)}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Manage Applications
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
            Review every application your listings have received, approve or
            reject the pending ones, and follow each accepted applicant through
            to their stay record and invoices.
          </p>
        </div>

        {isManager ? (
          <ManagerNav activeHref="/manage-application" className="w-fit" />
        ) : (
          <OwnerNav activeHref="/manage-application" className="w-fit" />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Applications"
          value={applications.length}
          description="Across all of your listings"
        />
        <StatCard
          title="Pending review"
          value={countBy("PENDING")}
          description="Waiting for a decision"
        />
        <StatCard
          title="Approved"
          value={countBy("APPROVED")}
          description="Stay records created"
        />
        <StatCard
          title="Confirmed stays"
          value={stays.filter((stay) => stay.status === "CONFIRMED").length}
          description="Currently active tenancies"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            baseUrl="/manage-application"
            paramKey="status"
            active={status}
            query={{ search: search || undefined, limit: String(limit) }}
            tabs={[
              { value: "", label: "All", count: applications.length },
              ...APPLICATION_STATUSES.map((value) => ({
                value,
                label: APPLICATION_STATUS_LABELS[value],
                count: countBy(value),
              })),
            ]}
          />
          <TableSearch
            label="Search applications"
            placeholder="Search applicant or listing…"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={rows}
              columns={columns}
              meta={meta}
              baseUrl="/manage-application"
              rowKey={(row) => row.id}
              itemLabel="application"
              query={listQuery}
              emptyMessage={
                search || status
                  ? "No application matches these filters."
                  : "No applications yet — they arrive when a tenant applies for one of your listings."
              }
            />
          </CardContent>
        </Card>
      </div>

      {selected ? (
        <ApplicationDetailSheet
          application={selected}
          stay={selectedStay}
          closeHref={hrefWith("applicationId")}
        />
      ) : null}
    </div>
  );
}
