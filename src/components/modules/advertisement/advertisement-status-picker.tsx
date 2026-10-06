"use client";

import { cn } from "cn";
import { ADVERTISEMENT_STATUS_LABELS, ADVERTISEMENT_STATUSES } from "@/types";

export interface AdvertisementStatusPickerProps {
  /** The advertisement's current status — rendered highlighted and disabled. */
  value: string;
  /** Disables every status while an update is in flight. */
  disabled?: boolean;
  onChange: (status: string) => void;
}

/**
 * Status changer for one advertisement. The current status is both visually
 * highlighted and disabled — you cannot re-pick the status you are already on —
 * and a `DRAFT` is never clickable: publishing is the only way out of a draft.
 */
export function AdvertisementStatusPicker({
  value,
  disabled = false,
  onChange,
}: AdvertisementStatusPickerProps) {
  return (
    <fieldset>
      <legend className="sr-only">Change advertisement status</legend>
      <div className="flex flex-wrap items-center gap-2">
        {ADVERTISEMENT_STATUSES.map((status) => {
          const isCurrent = status === value;
          const isDraft = status === "DRAFT";
          const locked = disabled || isCurrent || isDraft;
          const label = ADVERTISEMENT_STATUS_LABELS[status];

          return (
            <button
              key={status}
              type="button"
              aria-pressed={isCurrent}
              disabled={locked}
              title={
                isCurrent
                  ? `Current status: ${label}`
                  : isDraft
                    ? "Drafts are not re-selectable — publish to leave one"
                    : `Set status to ${label}`
              }
              onClick={() => onChange(status)}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : isDraft
                    ? "cursor-not-allowed border-border bg-muted text-muted-foreground/70 opacity-70"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {label}
              {isCurrent ? <span className="sr-only"> (current)</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
