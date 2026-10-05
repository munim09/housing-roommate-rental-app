import { redirect } from "next/navigation";
import { getSessionClaims, roleHome } from "@/lib/server-session";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "TENANT") redirect(roleHome(claims.role));
  return <>{children}</>;
}
