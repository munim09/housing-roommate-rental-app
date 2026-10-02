import { cn } from "cn";
import type { StoredUserStatus } from "@/api/admin.api";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<StoredUserStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
  PENDING_APPROVAL: "Pending",
};

const STATUS_VARIANTS: Record<
  StoredUserStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  SUSPENDED: "destructive",
  REJECTED: "destructive",
  PENDING_APPROVAL: "secondary",
};

/** `PENDING_APPROVAL` reads as "Pending" in the UI, never as the raw enum. */
export function StatusBadge({
  status,
  className,
}: {
  status: StoredUserStatus;
  className?: string;
}) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
      className={cn("capitalize", className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
