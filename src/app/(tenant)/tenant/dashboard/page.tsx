"use client";

import { useEffect, useState } from "react";
import {
  getTenantApplications,
  getTenantStays,
  updateTenantApplicationStatus,
} from "@/api/tenant.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

export default function DashboardPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [appRes, stayRes] = await Promise.all([
        getTenantApplications(),
        getTenantStays(),
      ]);
      const appData = (appRes as any)?.data ?? appRes;
      const stayData = (stayRes as any)?.data ?? stayRes;
      if ((appRes as any)?.success || Array.isArray(appData)) setApps(Array.isArray(appData) ? appData : []);
      if ((stayRes as any)?.success || Array.isArray(stayData)) setStays(Array.isArray(stayData) ? stayData : []);
    } catch (e: any) {
      toast.add({ title: "Error", description: e?.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await updateTenantApplicationStatus(id, status);
      if (res.success) {
        toast.add({
          title: "Updated",
          description: res.message,
          type: "success",
        });
        await load();
      } else {
        toast.add({ title: "Failed", description: res.message, type: "error" });
      }
    } catch (e: any) {
      toast.add({ title: "Error", description: e?.message, type: "error" });
    } finally {
      setUpdating(null);
    }
  };

  const canUpdate = (app: any) => {
    const s = app.status?.toUpperCase();
    if (s === "PENDING") return true;
    if (s === "APPROVED") {
      const stay = stays.find((st) => st.applicationId === app.id);
      if (stay?.status === "WAITING_FOR_PAYMENT") return true;
    }
    return false;
  };

  const stayMap = new Map(stays.map((s) => [s.applicationId, s]));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Tenant Dashboard
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Applications & Stays</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner className="size-4" />
              Loading...
            </div>
          ) : apps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications found
            </p>
          ) : (
            <div className="space-y-4">
              {apps.map((app) => {
                const stay = stayMap.get(app.id);
                const showStay =
                  stay && stay.status?.toUpperCase() !== "WAITING_FOR_PAYMENT";
                return (
                  <div key={app.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <a
                          href={`/tenant/application/${app.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {app.advertisement?.title || "Application"}
                        </a>
                        <p className="text-sm text-muted-foreground">
                          Application Status: {app.status}
                        </p>
                        {canUpdate(app) && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updating === app.id}
                              onClick={() => handleUpdate(app.id, "WITHDRAWN")}
                            >
                              Withdraw
                            </Button>
                          </div>
                        )}
                      </div>
                      {showStay && (
                        <div className="flex-1 rounded-md border p-3">
                          <p className="font-medium">Stay {stay.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Stay Status: {stay.status}
                          </p>
                          {stay.application?.advertisement?.title && (
                            <p className="text-sm">
                              {stay.application.advertisement.title}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
