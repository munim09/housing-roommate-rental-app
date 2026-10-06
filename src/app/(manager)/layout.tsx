import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSessionClaims, roleHome } from "@/lib/server-session";

/**
 * Every route in this group is manager-only.
 *
 * The role is read from the signed access token rather than the `authUser`
 * cookie, so a hand-edited cookie cannot open this surface. The proxy applies
 * the same rule, but repeating the check here means the rule belongs to the
 * routes instead of to a matcher someone has to remember to update.
 */
export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const claims = await getSessionClaims();

  if (!claims) {
    redirect("/login");
  }

  if (claims.role !== "MANAGER") {
    redirect(roleHome(claims.role));
  }

  // Every manager page gets the same chrome: nav options, the signed-in name,
  // and logout — kept here so no manager route can ship without it.
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
