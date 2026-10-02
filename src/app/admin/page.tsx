import type { AdminUser, DashboardStats } from "@/api/admin.api";
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

export default async function AdminDashboardPage({
  searchParams,
}: PageProps<"/admin">) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const [statsRes, usersRes] = await Promise.all([
    authedFetch("/admin/dashboard").then(
      (res) => res.json() as Promise<ApiResponse<DashboardStats>>,
    ),
    authedFetch(`/admin/users/profiles?page=${page}&limit=${limit}`).then(
      (res) => res.json() as Promise<ApiResponse<AdminUser[]>>,
    ),
  ]);

  const stats = statsRes.data;
  const users = statsRes.success ? (usersRes.data ?? []) : [];

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
