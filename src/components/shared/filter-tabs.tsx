import { cn } from "cn";
import Link from "next/link";

export interface FilterTab {
  value: string;
  label: string;
  count?: number;
}

/** Existing URL filters, forwarded so switching tab does not drop them. */
type TabQuery = Record<string, string | string[] | undefined>;

export interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  baseUrl: string;
  query?: TabQuery;
  /** Query key the tab writes into. Defaults to `tab`. */
  paramKey?: string;
  className?: string;
}

/**
 * Renders each tab as a link so the active view, the search term and the page
 * number all survive a refresh and can be shared. A Server Component — there is
 * no state to hydrate.
 */
export function FilterTabs({
  tabs,
  active,
  baseUrl,
  query,
  paramKey = "tab",
  className,
}: FilterTabsProps) {
  const hrefFor = (value: string) => {
    const params = new URLSearchParams();

    for (const [key, entry] of Object.entries(query ?? {})) {
      if (entry === undefined) continue;

      if (Array.isArray(entry)) {
        for (const item of entry) params.append(key, item);
      } else {
        params.set(key, entry);
      }
    }

    // A new view always restarts at page 1; the caller decides which of the
    // remaining filters belong to it by only forwarding the relevant keys.
    params.delete("page");
    params.set(paramKey, value);

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div
      role="tablist"
      aria-label="Views"
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-xl border bg-muted/40 p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;

        return (
          <Link
            key={tab.value}
            href={hrefFor(tab.value)}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors no-underline",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
