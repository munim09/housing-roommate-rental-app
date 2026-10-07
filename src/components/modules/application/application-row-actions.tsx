"use client";

import { cn } from "cn";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { OwnerManagerApplication } from "@/types";
import { ApplicationDecisionButtons } from "./application-decision-buttons";

export interface ApplicationRowActionsProps {
  application: OwnerManagerApplication;
  /** Current URL with `applicationId` set — the drawer is opened by the link. */
  detailHref: string;
}

/**
 * Per-row controls on `/manage-application`: open the detail drawer, and —
 * while the application is still `PENDING` — approve or reject it inline.
 * The decision itself lives in `ApplicationDecisionButtons`, which the drawer
 * reuses, so both places share one confirm dialog and one mutation.
 */
export function ApplicationRowActions({
  application,
  detailHref,
}: ApplicationRowActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Link
        href={detailHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "xs" }),
          "no-underline",
        )}
      >
        <EyeIcon aria-hidden="true" />
        View
      </Link>

      <ApplicationDecisionButtons application={application} size="xs" />
    </div>
  );
}
