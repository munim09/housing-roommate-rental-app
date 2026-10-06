import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSessionClaims, roleHome } from "@/lib/server-session";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "TENANT") redirect(roleHome(claims.role));

  // Every tenant page gets the same chrome: nav options, the signed-in name,
  // and logout — kept here so no tenant route can ship without it.
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
