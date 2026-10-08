import { MaintenanceUpdateSheet } from "@/components/modules/maintenance/maintenance-update-sheet";
import { ManagerNav } from "@/components/modules/manager/manager-nav";
import { OwnerNav } from "@/components/modules/owner/owner-nav";
import {
    DataTable,
    type DataTableColumn,
} from "@/components/shared/data-table";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { MaintenancePriorityBadge } from "@/components/shared/maintenance-priority-badge";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSearch } from "@/components/shared/table-search";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authedFetchJson } from "@/lib/auth-fetched";
import { formatDateTime } from "@/lib/format";
import { getSessionClaims } from "@/lib/server-session";
import {
    type ApiResponse,
    MAINTENANCE_STATUS_LABELS,
    MAINTENANCE_STATUSES,
    type MaintenanceRequest,
    type Meta,
} from "@/types";
import { cn } from "cn";
import { WrenchIcon } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Manage Maintenance",
};

/** The list call is paginated and has no status filter, so it is drained once. */
const FETCH_LIMIT = 50;
const MAX_PAGES = 20;

const DEFAULT_LIMIT = 10;

function firstParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function rowsOf<T>(response: ApiResponse<T[]> | undefined): T[] {
    return Array.isArray(response?.data) ? response.data : [];
}

/**
 * Drains `GET /manager/maintenance-requests` (OWNER and MANAGER), then status,
 * search and paging are applied from the URL — the tab counts always reflect
 * the whole feed rather than the rows one status filter returned.
 */
async function fetchAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const requests: MaintenanceRequest[] = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
        const response = await authedFetchJson<
            ApiResponse<MaintenanceRequest[]>
        >(`/manager/maintenance-requests?page=${page}&limit=${FETCH_LIMIT}`);

        requests.push(...rowsOf(response));

        const totalPages = Number(response?.meta?.totalPages ?? 1);
        if (!Number.isFinite(totalPages) || page >= totalPages) break;
    }

    return requests;
}

function matchesSearch(request: MaintenanceRequest, search: string): boolean {
    if (!search) return true;

    const haystack = [
        request.issue,
        request.description,
        request.stay?.property?.name,
        request.stay?.property?.address,
        request.stay?.flat?.flatNumber,
        request.stay?.room?.roomNumber,
        request.reportedBy?.name,
        request.reportedBy?.email,
        request.reportedBy?.phone,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return haystack.includes(search.toLowerCase());
}

export default async function ManageMaintenancePage({
    searchParams,
}: PageProps<"/manage-maintenance">) {
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
    const requestId = firstParam(params.requestId) ?? "";

    const [claims, requests] = await Promise.all([
        getSessionClaims(),
        fetchAllMaintenanceRequests(),
    ]);
    const isManager = claims?.role === "MANAGER";

    const countBy = (value: string) =>
        requests.filter((request) => request.status === value).length;

    const matched = requests.filter(
        (request) =>
            (!status || request.status === status) &&
            matchesSearch(request, search),
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

    const selected = requestId
        ? (requests.find((request) => request.id === requestId) ?? null)
        : null;

    /** Keeps the active filters; `requestId` is the one key this toggles. */
    const hrefWith = (key: string, value?: string) => {
        const next = new URLSearchParams();

        if (status) next.set("status", status);
        if (search) next.set("search", search);
        if (currentPage > 1) next.set("page", String(currentPage));
        if (limit !== DEFAULT_LIMIT) next.set("limit", String(limit));
        if (value) next.set(key, value);
        else next.delete(key);

        const query = next.toString();
        return query ? `/manage-maintenance?${query}` : "/manage-maintenance";
    };

    const listQuery = {
        status: status || undefined,
        search: search || undefined,
        limit: String(limit),
    };

    const columns: DataTableColumn<MaintenanceRequest>[] = [
        {
            key: "issue",
            header: "Issue",
            cell: (row) => (
                <div className="min-w-0 max-w-64">
                    <p className="truncate font-medium">{row.issue}</p>
                    {row.description ? (
                        <p className="truncate text-xs text-muted-foreground">
                            {row.description}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            key: "property",
            header: "Property",
            cell: (row) => (
                <div className="min-w-0">
                    <p className="truncate">
                        {row.stay?.property?.name ?? "Property unavailable"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {[
                            row.stay?.flat?.flatNumber
                                ? `Flat ${row.stay.flat.flatNumber}`
                                : null,
                            row.stay?.room?.roomNumber
                                ? `Room ${row.stay.room.roomNumber}`
                                : null,
                        ]
                            .filter(Boolean)
                            .join(" · ") ||
                            row.stay?.property?.address ||
                            "—"}
                    </p>
                </div>
            ),
        },
        {
            key: "reportedBy",
            header: "Reported by",
            cell: (row) => (
                <div className="min-w-0">
                    <p className="truncate">{row.reportedBy?.name ?? "—"}</p>
                    {row.reportedBy?.email ? (
                        <p className="truncate text-xs text-muted-foreground">
                            {row.reportedBy.email}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            key: "priority",
            header: "Priority",
            cell: (row) => <MaintenancePriorityBadge priority={row.priority} />,
        },
        {
            key: "status",
            header: "Status",
            cell: (row) => (
                <StatusBadge status={(row.status ?? "").toUpperCase()} />
            ),
        },
        {
            key: "createdAt",
            header: "Reported",
            cell: (row) => (
                <span className="text-xs whitespace-nowrap">
                    {formatDateTime(row.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            header: <span className="sr-only">Actions</span>,
            className: "text-end",
            cell: (row) => (
                <Link
                    href={hrefWith("requestId", row.id)}
                    className={cn(
                        buttonVariants({ variant: "outline", size: "xs" }),
                        "no-underline",
                    )}
                >
                    <WrenchIcon aria-hidden="true" />
                    Manage
                </Link>
            ),
        },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Manage Maintenance
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
                        Every issue your tenants report across your stays:
                        schedule the visit, move it from open to in progress,
                        and stamp the resolution so the tenant sees the change
                        immediately.
                    </p>
                </div>

                {isManager ? (
                    <ManagerNav
                        activeHref="/manage-maintenance"
                        className="w-fit"
                    />
                ) : (
                    <OwnerNav
                        activeHref="/manage-maintenance"
                        className="w-fit"
                    />
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Requests"
                    value={requests.length}
                    description="Reported across all of your stays"
                />
                <StatCard
                    title="Open"
                    value={countBy("OPEN")}
                    description="Waiting to be picked up"
                />
                <StatCard
                    title="In progress"
                    value={countBy("IN_PROGRESS")}
                    description="A visit has been scheduled"
                />
                <StatCard
                    title="Resolved"
                    value={countBy("RESOLVED")}
                    description="Work reported as done"
                />
            </div>

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <FilterTabs
                        baseUrl="/manage-maintenance"
                        paramKey="status"
                        active={status}
                        query={{
                            search: search || undefined,
                            limit: String(limit),
                        }}
                        tabs={[
                            { value: "", label: "All", count: requests.length },
                            ...MAINTENANCE_STATUSES.map((value) => ({
                                value,
                                label: MAINTENANCE_STATUS_LABELS[value],
                                count: countBy(value),
                            })),
                        ]}
                    />
                    <TableSearch
                        label="Search maintenance requests"
                        placeholder="Search issue, property or tenant…"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Maintenance requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={rows}
                            columns={columns}
                            meta={meta}
                            baseUrl="/manage-maintenance"
                            rowKey={(row) => row.id}
                            itemLabel="request"
                            query={listQuery}
                            emptyMessage={
                                search || status
                                    ? "No request matches these filters."
                                    : "No maintenance requests yet — they appear as soon as a tenant reports an issue on one of your stays."
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            {selected ? (
                <MaintenanceUpdateSheet
                    request={selected}
                    closeHref={hrefWith("requestId")}
                />
            ) : null}
        </div>
    );
}
