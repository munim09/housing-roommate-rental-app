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
 * flats and rooms share the `ACTIVE / INACTIVE / ARCHIVED` vocabulary, and
 * invoices and payments add their own `PENDING / PAID` and gateway outcomes.
 */
const STATUS_PRESENTATION: Record<string, StatusPresentation> = {
  ACTIVE: { label: "Active", variant: "default" },
  INACTIVE: { label: "Inactive", variant: "outline" },
  ARCHIVED: { label: "Archived", variant: "secondary" },
  PENDING_APPROVAL: { label: "Pending", variant: "secondary" },
  PENDING: { label: "Pending", variant: "secondary" },
  PAID: { label: "Paid", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
  SUCCESS: { label: "Successful", variant: "default" },
  PROCESSING: { label: "Processing", variant: "secondary" },
  FAILED: { label: "Failed", variant: "destructive" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  APPROVED: { label: "Approved", variant: "default" },
  WITHDRAWN: { label: "Withdrawn", variant: "outline" },
  EXPIRED: { label: "Expired", variant: "outline" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  WAITING_FOR_PAYMENT: { label: "Awaiting payment", variant: "secondary" },
  TERMINATED: { label: "Terminated", variant: "outline" },
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
