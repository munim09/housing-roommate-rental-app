import { cn } from "cn";
import { LayoutDashboardIcon, MapPinnedIcon } from "lucide-react";
import Link from "next/link";

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  {
    href: "/manage-areas",
    label: "Cities & Areas",
    icon: MapPinnedIcon,
  },
] as const;

export interface AdminNavProps {
  /** Route of the current page, so the matching pill can be marked current. */
  activeHref: string;
  className?: string;
}

/**
 * Server-rendered sub-navigation for the admin surface. Both destinations are
 * plain links, so switching pages keeps every filter in the URL and the active
 * pill needs no client state.
 */
export function AdminNav({ activeHref, className }: AdminNavProps) {
  return (
    <nav
      aria-label="Admin sections"
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-xl border bg-muted/40 p-1",
        className,
      )}
    >
      {ADMIN_NAV_LINKS.map((link) => {
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
