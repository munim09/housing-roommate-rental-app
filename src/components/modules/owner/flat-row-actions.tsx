"use client";

import { BedDoubleIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OwnerFlat } from "@/types";
import { EditFlatDialog } from "./edit-flat-dialog";
import { FlatImagesDialog } from "./flat-images-dialog";

export interface FlatRowActionsProps {
  flat: OwnerFlat;
}

/**
 * Per-row write actions.
 *
 * "Add room" is deliberately disabled: the backend has no owner room-create
 * route documented yet, and the assignment forbids faking a flow. It is kept in
 * the row — rather than hidden — so the intended next step is visible while the
 * button explains itself instead of dead-ending.
 */
export function FlatRowActions({ flat }: FlatRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <FlatImagesDialog flat={flat} />
      <EditFlatDialog flat={flat} />

      <Button
        variant="ghost"
        size="icon-sm"
        disabled
        title="Adding rooms is not wired up yet"
      >
        <BedDoubleIcon aria-hidden="true" />
        <span className="sr-only">Add rooms to flat {flat.flatNumber}</span>
      </Button>
    </div>
  );
}

/** Icon-only edit affordance reused by the rooms sheet header. */
export function EditFlatButton({ flat }: FlatRowActionsProps) {
  return (
    <EditFlatDialog flat={flat} trigger={<PencilIcon aria-hidden="true" />} />
  );
}
