import { cn } from "cn";
import type { StoredUserStatus } from "@/api/admin.api";
import { Badge } from "@/components/ui/badge";

export type StatusBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

interface StatusPresentation {
  label: string;
  variant: StatusBadgeVariant;
}

/**
 * One badge for every lifecycle status in the app: user accounts, properties,
 * flats and rooms all reuse the same three-state `ACTIVE / INACTIVE / ARCHIVED`
 * vocabulary, so they are listed once here.
 */
const STATUS_PRESENTATION: Record<string, StatusPresentation> = {
  ACTIVE: { label: "Active", variant: "default" },
  INACTIVE: { label: "Inactive", variant: "outline" },
  ARCHIVED: { label: "Archived", variant: "secondary" },
  PENDING_APPROVAL: { label: "Pending", variant: "secondary" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

/** `PENDING_APPROVAL` reads as "Pending" in the UI, never as the raw enum. */
function present(status: string): StatusPresentation {
  return (
    STATUS_PRESENTATION[status] ?? {
      label: status.replaceAll("_", " ").toLowerCase(),
      variant: "secondary",
    }
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: StoredUserStatus | string;
  className?: string;
}) {
  const { label, variant } = present(status);

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
}
