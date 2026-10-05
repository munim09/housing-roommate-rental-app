"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useMyAdvertisements, useUpdateAdvertisementStatus } from "@/hooks";

export default function ManageAdvertisementPage() {
  const { data: ads = [], isLoading } = useMyAdvertisements();
  const updateStatus = useUpdateAdvertisementStatus();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatus = (adId: string, status: string) => {
    setUpdating(adId);
    updateStatus.mutate(
      { advertisementId: adId, status },
      {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Failed",
              description: res.message,
              type: "error",
            });
          } else {
            toast.add({
              title: "Updated",
              description: res.message,
              type: "success",
            });
          }
          setUpdating(null);
        },
        onError: (err: any) => {
          toast.add({
            title: "Error",
            description: err?.message,
            type: "error",
          });
          setUpdating(null);
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Manage Advertisements
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        View, create, update, and manage advertisement status
      </p>

      {isLoading ? (
        <div className="mt-6 flex items-center gap-2">
          <Spinner className="size-4" />
          Loading advertisements...
        </div>
      ) : ads.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No advertisements found
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {ads.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{ad.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {ad.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>Rental Type: {ad.rentalType}</p>
                  {ad.flat && <p>Flat: {ad.flat.flatNumber}</p>}
                  {ad.room && <p>Room: {ad.room.roomNumber}</p>}
                  <p>Rent: {ad.monthlyRent}</p>
                  <p>
                    Available: {new Date(ad.availableFrom).toLocaleDateString()}{" "}
                    to {new Date(ad.availableTo).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(ad.id, "PUBLISHED")}
                      disabled={updating === ad.id}
                    >
                      Publish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(ad.id, "DRAFT")}
                      disabled={updating === ad.id}
                    >
                      Draft
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(ad.id, "PAUSED")}
                      disabled={updating === ad.id}
                    >
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(ad.id, "CLOSED")}
                      disabled={updating === ad.id}
                    >
                      Close
                    </Button>
                    <Button size="sm" variant="outline" disabled>
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
