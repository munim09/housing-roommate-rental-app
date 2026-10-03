import { cn } from "cn";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Meta } from "@/types";

export interface DataTableColumn<T> {
  key: string;
  /** A node so a column can hide its header with `sr-only` and stay accessible. */
  header: React.ReactNode;
  /** Falls back to the raw value when omitted. */
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

/** Existing URL filters, forwarded so paging does not drop them. */
type TableQuery = Record<string, string | string[] | undefined>;

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  meta?: Meta;
  baseUrl: string;
  rowKey: (row: T) => string;
  itemLabel?: string;
  emptyMessage?: string;
  query?: TableQuery;
}

/**
 * Stays a Server Component: `columns[].cell` and `rowKey` are render props,
 * and functions cannot cross the server -> client boundary.
 */
export function DataTable<T>({
  data,
  columns,
  meta,
  baseUrl,
  rowKey,
  itemLabel = "item",
  emptyMessage = "Nothing to show yet.",
  query,
}: DataTableProps<T>) {
  // Every filter/sort/page lives in the URL, so paging only has to swap `page`.
  const pageUrl = (page: number) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined) continue;

      if (Array.isArray(value)) {
        for (const entry of value) params.append(key, entry);
      } else {
        params.set(key, value);
      }
    }

    params.set("page", String(page));
    if (meta?.limit) params.set("limit", String(meta.limit));

    return `${baseUrl}?${params.toString()}`;
  };

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "p-3 text-start font-medium text-muted-foreground",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={rowKey(row)} className="border-b last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className={cn("p-3", column.className)}>
                    {column.cell
                      ? column.cell(row)
                      : String(
                          (row as Record<string, unknown>)[column.key] ?? "",
                        )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 ? (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between gap-3 border-t pt-4"
        >
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {meta.total} {itemLabel}
            {meta.total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={pageUrl(meta.page - 1)}
              aria-disabled={meta.page <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "no-underline",
                meta.page <= 1 && "pointer-events-none opacity-50",
              )}
            >
              Previous
            </Link>
            <Link
              href={pageUrl(meta.page + 1)}
              aria-disabled={meta.page >= meta.totalPages}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "no-underline",
                meta.page >= meta.totalPages &&
                  "pointer-events-none opacity-50",
              )}
            >
              Next
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
