import { cn } from "cn";
import { LayoutDashboardIcon, MegaphoneIcon } from "lucide-react";
import Link from "next/link";

export interface ManagerNavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboardIcon;
}

/**
 * Sections of the manager surface. Dashboard and advertising are live today;
 * the rest of the manager pages plug into this list as they land.
 */
export const MANAGER_NAV_LINKS: ManagerNavLink[] = [
  {
    href: "/manager/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/manage-advertisement",
    label: "Manage advertisements",
    icon: MegaphoneIcon,
  },
];

export interface ManagerNavProps {
  /** Route of the current page, so the matching pill can be marked current. */
  activeHref: string;
  className?: string;
}

/**
 * Server-rendered sub-navigation for the manager surface. Every destination is
 * a plain link, so switching pages keeps the URL the single source of truth and
 * the active pill needs no client state.
 */
export function ManagerNav({ activeHref, className }: ManagerNavProps) {
  return (
    <nav
      aria-label="Manager sections"
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-xl border bg-muted/40 p-1",
        className,
      )}
    >
      {MANAGER_NAV_LINKS.map((link) => {
        const Icon = link.icon;
        const isActive = activeHref === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
