import { cn } from "cn";
import { Building2Icon, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export interface OwnerNavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboardIcon;
  /**
   * Flats management has no route yet — it is listed so the owner surface reads
   * as a whole, but it renders inert until the page lands rather than 404ing.
   */
  disabled?: boolean;
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
    disabled: true,
  },
];

export interface OwnerNavProps {
  /** Route of the current page, so the matching pill can be marked current. */
  activeHref: string;
  className?: string;
}

/**
 * Server-rendered sub-navigation for the owner surface. Enabled destinations are
 * plain links, so switching pages keeps every filter in the URL and the active
 * pill needs no client state.
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

        if (link.disabled) {
          return (
            <span
              key={link.href}
              aria-disabled="true"
              title="Coming soon"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "cursor-not-allowed gap-2 text-muted-foreground opacity-60",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {link.label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase">
                Soon
              </span>
            </span>
          );
        }

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
