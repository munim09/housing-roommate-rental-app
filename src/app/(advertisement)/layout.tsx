import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSessionClaims, roleHome } from "@/lib/server-session";

/**
 * `/manage-advertisement`, `/manage-application` and `/manage-maintenance` are
 * served to both `OWNER` and `MANAGER`; every other role is moved to its own
 * home. The chrome lives here, so any owner/manager management page ships with
 * the header, footer and a signed-in session by construction.
 */
export default async function AdvertisementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "OWNER" && claims.role !== "MANAGER") {
    redirect(roleHome(claims.role));
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
