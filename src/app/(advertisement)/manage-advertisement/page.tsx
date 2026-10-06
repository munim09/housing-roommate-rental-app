import { ManagerNav } from "@/components/modules/manager/manager-nav";
import { OwnerNav } from "@/components/modules/owner/owner-nav";
import { getSessionClaims } from "@/lib/server-session";
import { ManageAdvertisementList } from "./page.client";

export default async function ManageAdvertisementPage() {
  const claims = await getSessionClaims();
  const isManager = claims?.role === "MANAGER";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Manage Advertisements
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
            Advertise a whole flat or a single room, edit the listing details,
            and move it between statuses.
          </p>
        </div>

        {isManager ? (
          <ManagerNav activeHref="/manage-advertisement" className="w-fit" />
        ) : (
          <OwnerNav activeHref="/manage-advertisement" className="w-fit" />
        )}
      </div>

      <ManageAdvertisementList />
    </div>
  );
}
