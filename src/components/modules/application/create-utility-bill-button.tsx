"use client";

import { DropletsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Placeholder for `POST /manager/utility-invoices`. The endpoint is not
 * published yet, so the option is surfaced — disabled — instead of being faked:
 * nothing here can issue a bill that the backend would not know about.
 */
export function CreateUtilityBillButton() {
  return (
    <div className="grid gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        aria-disabled="true"
        aria-describedby="utility-bill-pending"
      >
        <DropletsIcon aria-hidden="true" />
        Create utility bill
      </Button>
      <p id="utility-bill-pending" className="text-xs text-muted-foreground">
        Utility bill API is not published yet.
      </p>
    </div>
  );
}
