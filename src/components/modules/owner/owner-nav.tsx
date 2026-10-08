import { cn } from "cn";
import {
  Building2Icon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";

export interface OwnerNavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboardIcon;
}

export const OWNER_NAV_LINKS: OwnerNavLink[] = [
  {
    href: "/owner/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/owner/manage-flats",
    label: "Manage flats",
    icon: Building2Icon,
  },
  {
    href: "/manage-advertisement",
    label: "Manage advertisements",
    icon: MegaphoneIcon,
  },
  {
    href: "/manage-application",
    label: "Manage applications",
    icon: ClipboardListIcon,
  },
  {
    href: "/manage-maintenance",
    label: "Maintenance",
    icon: WrenchIcon,
  },
];

export interface OwnerNavProps {
  /** Route of the current page, so the matching pill can be marked current. */
  activeHref: string;
  className?: string;
}

/**
 * Server-rendered sub-navigation for the owner surface. Every destination is a
 * plain link, so switching pages keeps the URL the single source of truth and
 * the active pill needs no client state.
 */
export function OwnerNav({ activeHref, className }: OwnerNavProps) {
  return (
    <nav
      aria-label="Owner sections"
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-xl border bg-muted/40 p-1",
        className,
      )}
    >
      {OWNER_NAV_LINKS.map((link) => {
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
