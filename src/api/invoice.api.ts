import { authedFetchJson } from "@/lib/auth-fetched";
import type { ApiResponse, Invoice } from "@/types";

/** One of these is required by `GET /tenant/invoices/by-stay`. */
export interface InvoicesByStayQuery {
  applicationId?: string;
  stayId?: string;
}

/**
 * Invoices of a stay, via the httpOnly session cookie (`authedFetch`).
 * The backend answers 404 when the application has no stay yet, so callers
 * must only ask for applications that own one.
 */
export async function getInvoicesByStay(query: InvoicesByStayQuery) {
  const params = new URLSearchParams();

  if (query.applicationId) params.set("applicationId", query.applicationId);
  if (query.stayId) params.set("stayId", query.stayId);

  return authedFetchJson<ApiResponse<Invoice[]>>(
    `/tenant/invoices/by-stay?${params.toString()}`,
  );
}
