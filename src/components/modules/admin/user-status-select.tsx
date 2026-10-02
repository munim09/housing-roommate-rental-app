"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ADMIN_USER_STATUSES,
  type AdminUserStatus,
  type StoredUserStatus,
} from "@/api/admin.api";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUpdateUserStatus } from "@/hooks";

const STATUS_LABELS: Record<AdminUserStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
};

interface UserStatusSelectProps {
  userId: string;
  email: string;
  initialStatus: StoredUserStatus;
}

/**
 * `PATCH /admin/users/:id/status` is the only write the admin table needs, so
 * the row keeps a local copy of the status and revalidates on success instead
 * of waiting for a full router refresh.
 */
export function UserStatusSelect({
  userId,
  email,
  initialStatus,
}: UserStatusSelectProps) {
  const router = useRouter();
  const updateStatus = useUpdateUserStatus();
  const [status, setStatus] = useState<StoredUserStatus>(initialStatus);

  // `PENDING_APPROVAL` and `REJECTED` are read-only, so they have no matching
  // option and the trigger falls back to its placeholder.
  const isAssignable = ADMIN_USER_STATUSES.some((option) => option === status);
  const currentValue = isAssignable ? status : null;

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={status} />

      <Select
        value={currentValue}
        disabled={updateStatus.isPending}
        onValueChange={(next) => {
          if (!next) return;

          const nextStatus = next as AdminUserStatus;

          updateStatus.mutate(
            { userId, status: nextStatus },
            {
              onSuccess: (res) => {
                if (!res.success) {
                  toast.add({
                    title: "Server Failure",
                    description: "Something went wrong. Please try again",
                    type: "error",
                  });
                  return;
                }

                setStatus(nextStatus);
                toast.add({
                  title: "Status updated",
                  description: `${email} is now ${STATUS_LABELS[nextStatus].toLowerCase()}.`,
                  type: "success",
                });
                router.refresh();
              },
              onError: (err) => {
                toast.add({
                  title: "Status update failure",
                  description:
                    err.message || "Something went wrong. Please try again",
                  type: "error",
                });
              },
            },
          );
        }}
      >
        <SelectTrigger
          size="sm"
          className="w-32"
          aria-label={`Update status for ${email}`}
        >
          {updateStatus.isPending ? (
            <Spinner />
          ) : (
            <SelectValue placeholder="Change status" />
          )}
        </SelectTrigger>
        <SelectContent>
          {ADMIN_USER_STATUSES.map((option) => (
            <SelectItem key={option} value={option}>
              {STATUS_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
