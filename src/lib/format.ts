/**
 * Presentation helpers shared by the Server Component tables. They live here
 * rather than in a component because `loading.tsx` and `error.tsx` render
 * outside any page that could pass a formatter down.
 */

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

/** Short, unambiguous date for tables. Renders an em dash for missing values. */
export function formatDate(value?: string | null): string {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-GB", DATE_FORMAT);
}

/**
 * Every amount in the backend is BDT, so the symbol is fixed rather than
 * derived from a locale. Keeps two decimals only when there is a fraction,
 * which is how the `Decimal` columns arrive.
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === null || amount === undefined) return "—";

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
