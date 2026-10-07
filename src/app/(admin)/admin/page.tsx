import type { AdminUser, DashboardStats } from "@/api/admin.api";
import { InventoryChart } from "@/components/charts/inventory-chart";
import {
  type RoleCount,
  UsersByRoleChart,
} from "@/components/charts/users-by-role-chart";
import { AdminNav } from "@/components/modules/admin/admin-nav";
import { UserStatusSelect } from "@/components/modules/admin/user-status-select";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authedFetch } from "@/lib/auth-fetched";
import type { ApiResponse, Meta } from "@/types";

export const metadata = {
  title: "Admin Dashboard",
};

const ROLES = ["ADMIN", "OWNER", "MANAGER", "TENANT"] as const;

/**
 * `/admin/users?role=` answers with `meta.total`, so one `limit=1` request per
 * role gives the exact account count without paging through the list.
 */
async function fetchRoleCount(role: (typeof ROLES)[number]): Promise<number> {
  const res = await authedFetch(
    `/admin/users?role=${role}&limit=1&page=1`,
  ).then((response) => response.json() as Promise<ApiResponse<unknown[]>>);
  return res.success ? Number(res.meta?.total ?? 0) : 0;
}

export default async function AdminDashboardPage({
  searchParams,
}: PageProps<"/admin">) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const [statsRes, usersRes, roleCounts] = await Promise.all([
    authedFetch("/admin/dashboard").then(
      (res) => res.json() as Promise<ApiResponse<DashboardStats>>,
    ),
    authedFetch(`/admin/users/profiles?page=${page}&limit=${limit}`).then(
      (res) => res.json() as Promise<ApiResponse<AdminUser[]>>,
    ),
    Promise.all(ROLES.map((role) => fetchRoleCount(role))),
  ]);

  const stats = statsRes.data;
  const users = statsRes.success ? (usersRes.data ?? []) : [];
  const roleData: RoleCount[] = ROLES.map((role, index) => ({
    role,
    count: roleCounts[index] ?? 0,
  }));

  // `/admin/users/profiles` answers with a bare array and no `meta`, so the
  // pagination block is rebuilt here with the dashboard `users` count.
  const meta: Meta | undefined = stats
    ? {
        page,
        limit,
        total: stats.users,
        totalPages: Math.max(1, Math.ceil(stats.users / limit)),
      }
    : undefined;

  const userColumns: DataTableColumn<AdminUser>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <UserStatusSelect
          userId={row.id}
          email={row.email}
          initialStatus={row.status}
        />
      ),
    },
    { key: "phone", header: "Phone" },
    {
      key: "createdAt",
      header: "Created At",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Admin Dashboard
            </h1>
            <AdminNav activeHref="/admin" className="mt-4 w-fit" />
            {stats && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Users" value={stats.users} />
                <StatCard title="Properties" value={stats.properties} />
                <StatCard title="Flats" value={stats.flats} />
                <StatCard
                  title="Active Ads"
                  value={stats.activeAdvertisements}
                />
                <StatCard
                  title="Confirmed Stays"
                  value={stats.currentConfirmedStays}
                />
                <StatCard title="Active Owners" value={stats.activeOwners} />
                <StatCard
                  title="Active Managers"
                  value={stats.activeManagers}
                />
              </div>
            )}

            {stats ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Users by role</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Admins, owners, managers and tenants side by side, against
                      the platform total.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <UsersByRoleChart data={roleData} total={stats.users} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Properties, flats &amp; advertisements
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      How much inventory is listed compared with how much is
                      published for tenants.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <InventoryChart
                      data={[
                        { label: "Properties", count: stats.properties },
                        { label: "Flats", count: stats.flats },
                        {
                          label: "Advertisements",
                          count: stats.activeAdvertisements,
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : null}

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={users}
                    columns={userColumns}
                    meta={meta}
                    baseUrl="/admin"
                    rowKey={(row) => row.id}
                    itemLabel="user"
                    query={params}
                    emptyMessage="No users match these filters."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
