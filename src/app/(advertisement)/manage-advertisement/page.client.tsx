"use client";

import { MegaphoneIcon } from "lucide-react";
import { useState } from "react";
import { AdvertisementStatusPicker } from "@/components/modules/advertisement/advertisement-status-picker";
import { advertisementTargetLabel } from "@/components/modules/advertisement/advertisement-target";
import { CreateAdvertisementDialog } from "@/components/modules/advertisement/create-advertisement-dialog";
import { EditAdvertisementDialog } from "@/components/modules/advertisement/edit-advertisement-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useMyAdvertisements, useUpdateAdvertisementStatus } from "@/hooks";
import { formatCurrency } from "@/lib/format";
import type { Advertisement } from "@/types";

function formatDate(value: string | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function AdvertisementCard({
  advertisement,
  pending,
  onStatusChange,
}: {
  advertisement: Advertisement;
  pending: boolean;
  onStatusChange: (status: string) => void;
}) {
  const createdBy = advertisement.createdBy;
  const author = createdBy
    ? `${createdBy.name ?? "Unknown"} (${createdBy.role ?? "user"})`
    : "You";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-start justify-between gap-2">
          <span className="min-w-0 flex-1 truncate">{advertisement.title}</span>
          <Badge variant="secondary">
            {advertisement.room ? "Room" : "Entire Flat"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <span className="text-muted-foreground">
            {advertisementTargetLabel(advertisement)}
          </span>
          <span className="font-medium">
            {formatCurrency(Number(advertisement.monthlyRent))}/month
          </span>
          <span className="text-muted-foreground">
            {formatDate(advertisement.availableFrom)} →{" "}
            {formatDate(advertisement.availableTo)}
          </span>
        </div>

        {advertisement.description ? (
          <p className="text-sm text-muted-foreground text-pretty">
            {advertisement.description}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">By {author}</p>

        <AdvertisementStatusPicker
          value={advertisement.status}
          disabled={pending}
          onChange={(status) => onStatusChange(status)}
        />
      </CardContent>
      <CardFooter>
        <EditAdvertisementDialog advertisement={advertisement} />
      </CardFooter>
    </Card>
  );
}

export function ManageAdvertisementList() {
  const { data: ads = [], isLoading } = useMyAdvertisements();
  const updateStatus = useUpdateAdvertisementStatus();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleStatusChange = (advertisementId: string, status: string) => {
    setPendingId(advertisementId);
    updateStatus.mutate(
      { advertisementId, status },
      {
        onSuccess: (res) => {
          setPendingId(null);
          toast.add({
            title: "Status updated",
            description:
              res.message ??
              (res.success
                ? "Advertisement status changed."
                : "Something went wrong."),
            type: res.success ? "success" : "error",
          });
        },
        onError: (error: Error) => {
          setPendingId(null);
          toast.add({
            title: "Could not change the status",
            description:
              error.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading advertisements…"
            : `${ads.length} advertisement${ads.length === 1 ? "" : "s"}`}
        </p>
        <CreateAdvertisementDialog />
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-3 rounded-xl border p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : ads.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MegaphoneIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No advertisements yet</EmptyTitle>
            <EmptyDescription>
              Advertise a flat or a room to start reaching tenants looking for a
              home.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateAdvertisementDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {ads.map((advertisement) => (
            <AdvertisementCard
              key={advertisement.id}
              advertisement={advertisement}
              pending={pendingId === advertisement.id}
              onStatusChange={(status) =>
                handleStatusChange(advertisement.id, status)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
