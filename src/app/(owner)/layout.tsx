import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLE_HOME } from "@/lib/session";
import type { AuthUser } from "@/types";

/**
 * Every route in this group is owner-only. `src/proxy.ts` already bounces
 * non-owners, but repeating the check in the layout makes the rule belong to the
 * routes themselves rather than to a matcher someone has to remember to update.
 *
 * Props are typed by hand because a route-group layout covers several routes,
 * so `LayoutProps<>` — which only accepts the root route — does not apply.
 */
export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const rawUser = cookieStore.get("authUser")?.value;

  if (!accessToken || !rawUser) {
    redirect("/login");
  }

  let user: AuthUser | null = null;

  try {
    user = JSON.parse(rawUser) as AuthUser;
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "OWNER") {
    redirect(ROLE_HOME[user.role] ?? "/");
  }

  return children;
}
