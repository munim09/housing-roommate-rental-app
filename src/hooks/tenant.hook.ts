import { useEffect, useState } from "react";
import { getTenantApplications, getTenantStays } from "@/api/tenant.api";

export function useTenantApplications(params?: { page?: number; limit?: number }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getTenantApplications(params), getTenantStays()])
      .then(([appsRes, staysRes]) => {
        if (!active) return;
        const apps = (appsRes as any)?.data ?? appsRes ?? [];
        const stays = (staysRes as any)?.data ?? staysRes ?? [];
        setData(apps);
        // side effect not returned; but hook returns state below
      })
      .catch((e) => active && setError(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params?.page, params?.limit]);

  return { applications: data, loading, error } as const;
}
