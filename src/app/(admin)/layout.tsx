import { redirect } from "next/navigation";
import { getSessionClaims, roleHome } from "@/lib/server-session";

/**
 * Every route in this group is admin-only.
 *
 * The role is read from the signed access token rather than the `authUser`
 * cookie, so a hand-edited cookie cannot open this surface. The proxy applies
 * the same rule, but repeating the check here means the rule belongs to the
 * routes instead of to a matcher someone has to remember to update.
 *
 * Props are typed by hand because a route-group layout covers several routes,
 * so `LayoutProps<>` — which only accepts the root route — does not apply.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const claims = await getSessionClaims();

  if (!claims) {
    redirect("/login");
  }

  if (claims.role !== "ADMIN") {
    redirect(roleHome(claims.role));
  }

  return children;
}
