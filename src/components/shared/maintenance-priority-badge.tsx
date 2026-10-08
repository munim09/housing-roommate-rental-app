import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_PRIORITY_LABELS,
  type MaintenancePriority,
} from "@/types";
import type { StatusBadgeVariant } from "./status-badge";

const PRIORITY_VARIANT: Record<MaintenancePriority, StatusBadgeVariant> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "default",
  URGENT: "destructive",
};

/**
 * One pill for `LOW / MEDIUM / HIGH / URGENT` on both maintenance surfaces —
 * the tenant's request list and the owner / manager desk. An unknown priority
 * (a value the backend adds later) still renders instead of crashing the row.
 */
export function MaintenancePriorityBadge({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  const known = (MAINTENANCE_PRIORITIES as readonly string[]).includes(
    priority,
  );
  const key = known ? (priority as MaintenancePriority) : null;

  return (
    <Badge
      variant={key ? PRIORITY_VARIANT[key] : "outline"}
      className={cn(className)}
    >
      {key
        ? MAINTENANCE_PRIORITY_LABELS[key]
        : priority.replaceAll("_", " ").toLowerCase()}
    </Badge>
  );
}
