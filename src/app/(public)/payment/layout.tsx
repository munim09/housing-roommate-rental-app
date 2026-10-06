/**
 * Shared shell for the gateway landing pages. It exists so `loading.tsx` and
 * `error.tsx` have a layout to attach to, and so none of these routes can be
 * prerendered — a payment status is always read fresh from the backend.
 */
export const dynamic = "force-dynamic";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
