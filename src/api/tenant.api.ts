import apiClient from "@/lib/api-client";
import { authedFetchJson } from "@/lib/auth-fetched";

export interface TenantApplication {
    id: string;
    rentalType?: string;
    status: string;
    requestedStartDate?: string;
    requestedEndDate?: string;
    note?: string | null;
    reviewedById?: string | null;
    reviewedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    advertisement?: any;
}

export interface TenantStay {
    id: string;
    applicationId?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    monthlyRent?: string | number;
    application?: any;
}

export async function getTenantApplications(params?: {
    page?: number;
    limit?: number;
}) {
    console.log("starting...... 1");
    const query = params
        ? "?" +
          new URLSearchParams(
              Object.entries(params)
                  .filter(([, v]) => v !== undefined && v !== null)
                  .map(([k, v]) => [k, String(v)]),
          ).toString()
        : "";
    return authedFetchJson(`/tenant/applications${query}`);
}

export async function getTenantApplication(applicationId: string) {
    return authedFetchJson(`/tenant/applications/${applicationId}`);
}

export async function getTenantStays() {
    return authedFetchJson(`/tenant/stays`);
}

export function updateTenantApplicationStatus(
    applicationId: string,
    status: string,
) {
    return apiClient<any>(`/tenant/applications/${applicationId}`, {
        method: "PATCH",
        body: { status },
    });
}
