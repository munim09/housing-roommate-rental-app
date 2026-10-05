"use client";

import { BedDoubleIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
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
 * The bed button is a link, not a mutation: rooms live inside the flat detail
 * page, which is also where they are added and updated, so the row sends the
 * owner there instead of opening a second place to manage them.
 */
export function FlatRowActions({ flat }: FlatRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <FlatImagesDialog flat={flat} />
      <EditFlatDialog flat={flat} />

      <Button
        variant="ghost"
        size="icon-sm"
        // A `Link` renders an anchor, so Base UI must not expect a real button.
        nativeButton={false}
        render={<Link href={`/owner/flats/${flat.id}`} />}
      >
        <BedDoubleIcon aria-hidden="true" />
        <span className="sr-only">View rooms of flat {flat.flatNumber}</span>
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
