import { Building2Icon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "@/components/site/logout-button";
import { ROLE_HOME, SESSION_COOKIES } from "@/lib/session";
import type { AuthUser } from "@/types";

export const SITE_NAV_LINKS = [
  { href: "/listings", label: "Browse" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#safety", label: "Safety" },
  { href: "/#owners", label: "For owners" },
] as const;

export function BrandMark() {
  return (
    <span
      className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
      aria-hidden="true"
    >
      <Building2Icon className="size-4" />
    </span>
  );
}

export async function SiteHeader() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(SESSION_COOKIES.user)?.value;
  let user: AuthUser | null = null;
  try {
    if (userCookie) {
      user = JSON.parse(userCookie) as AuthUser;
    }
  } catch {
    user = null;
  }
  const isAuthenticated = Boolean(user);
  // Resolved up front so the authenticated branch can index by role without a
  // null check, and so every role lands on the home its own surface defines.
  const dashboardHref = user ? ROLE_HOME[user.role] : "/login";

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="text-sm font-semibold tracking-tight">Dwellio</span>
        </Link>

        <nav className="ms-6 hidden items-center md:flex" aria-label="Primary">
          {SITE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5 bg-primary text-primary-foreground hover:bg-primary/80"
              >
                Get started
              </Link>
            </>
          ) : (
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">
                {user?.name}
              </span>
              <Link
                href={dashboardHref}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5 bg-primary text-primary-foreground hover:bg-primary/80"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
