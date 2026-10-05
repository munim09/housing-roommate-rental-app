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
      if (appRes.success) setApps(appRes.data || []);
      if (stayRes.success) setStays(stayRes.data || []);
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

  const filteredStays = stays.filter(
    (st) => st.status?.toUpperCase() !== "WAITING_FOR_PAYMENT",
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Tenant Dashboard
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Applications</CardTitle>
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
              {apps.map((app) => (
                <div key={app.id} className="rounded-lg border p-4">
                  <p className="font-medium">
                    {app.advertisement?.title || "Application"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {app.status}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stay Records (excluding WAITING_FOR_PAYMENT)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner className="size-4" />
              Loading...
            </div>
          ) : filteredStays.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stays to show</p>
          ) : (
            <div className="space-y-4">
              {filteredStays.map((st) => (
                <div key={st.id} className="rounded-lg border p-4">
                  <p className="font-medium">Stay {st.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {st.status}
                  </p>
                  {st.application?.advertisement?.title && (
                    <p className="text-sm">
                      {st.application.advertisement.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
