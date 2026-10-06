import { cn } from "cn";
import { LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";

export interface TenantNavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboardIcon;
}

export const TENANT_NAV_LINKS: TenantNavLink[] = [
  {
    href: "/tenant/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
];

export interface TenantNavProps {
  /** Route of the current page, so the matching pill can be marked current. */
  activeHref?: string;
  /**
   * Label of the page you are on when it has no route of its own in the list —
   * an application detail, for example. Rendered as a non-link current pill so
   * the visitor can still tell where they are.
   */
  currentLabel?: string;
  className?: string;
}

/**
 * Server-rendered sub-navigation for the tenant surface. Every destination is
 * a plain link, so switching pages keeps the URL the single source of truth and
 * the active pill needs no client state.
 */
export function TenantNav({
  activeHref = "",
  currentLabel,
  className,
}: TenantNavProps) {
  const pillClass = (isActive: boolean) =>
    cn(
      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline",
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
    );

  return (
    <nav
      aria-label="Tenant sections"
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-xl border bg-muted/40 p-1",
        className,
      )}
    >
      {TENANT_NAV_LINKS.map((link) => {
        const Icon = link.icon;
        const isActive = activeHref === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={pillClass(isActive)}
          >
            <Icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}

      {currentLabel ? (
        <span aria-current="page" className={pillClass(true)}>
          {currentLabel}
        </span>
      ) : null}
    </nav>
  );
}
