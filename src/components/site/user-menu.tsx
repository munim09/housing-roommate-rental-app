"use client";

import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function UserMenu({
  name,
  dashboardHref,
}: {
  name?: string | null;
  dashboardHref: string;
}) {
  const displayName = name?.trim() || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-9 items-center gap-1.5 rounded-full px-1.5 sm:gap-2 sm:px-2"
            aria-label="Open user menu"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initial}
            </span>

            <span
              className="max-w-24 truncate text-sm font-medium sm:max-w-28"
              title={displayName}
            >
              {displayName}
            </span>

            <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        }
      />

      <PopoverContent className="w-60 p-1.5" align="end" sideOffset={8}>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 rounded-lg px-2.5 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold" title={displayName}>
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground">My account</p>
            </div>
          </div>

          <div className="my-1 h-px bg-border" />

          <Button
            nativeButton={false}
            render={<Link href={dashboardHref} />}
            variant="ghost"
            size="sm"
            className="justify-start gap-2.5 rounded-md"
          >
            <LayoutDashboardIcon className="size-4 text-muted-foreground" />
            Dashboard
          </Button>

          <Button
            nativeButton={false}
            render={<Link href="/profile" />}
            variant="ghost"
            size="sm"
            className="justify-start gap-2.5 rounded-md"
          >
            <UserIcon className="size-4 text-muted-foreground" />
            Profile
          </Button>

          <div className="my-1 h-px bg-border" />

          <form action="/logout" method="post">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2.5 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOutIcon className="size-4" />
              Logout
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
