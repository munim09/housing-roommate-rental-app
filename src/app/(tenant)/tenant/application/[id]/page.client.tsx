"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { updateTenantApplicationStatus } from "@/api/tenant.api";

export function CancelApplication({ app, stay }: { app: any; stay: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const appStatus = app.status?.toUpperCase();
  const stayStatus = stay?.status?.toUpperCase();
  const canCancel =
    appStatus === "PENDING" ||
    (appStatus === "APPROVED" && stayStatus === "WAITING_FOR_PAYMENT");

  if (!canCancel) return null;

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await updateTenantApplicationStatus(app.id, "WITHDRAWN");
      if (res.success) {
        toast.add({ title: "Cancelled", description: res.message, type: "success" });
        router.push("/tenant/dashboard");
        router.refresh();
      } else {
        toast.add({ title: "Failed", description: res.message, type: "error" });
      }
    } catch (e: any) {
      toast.add({ title: "Error", description: e?.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
      {loading ? <Spinner className="size-4" /> : "Cancel Application"}
    </Button>
  );
}