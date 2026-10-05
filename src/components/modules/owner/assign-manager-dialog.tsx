"use client";

import { UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAssignManager } from "@/hooks";
import { useActiveManagers } from "@/hooks/area.hook";
import type { FlatManager } from "@/types";

export function AssignManagerDialog({ flatId }: { flatId: string }) {
  const router = useRouter();
  const { data: managers = [], isLoading } = useActiveManagers();
  const assignManager = useAssignManager();
  const [open, setOpen] = useState(false);
  const [managerId, setManagerId] = useState("");

  const handleSubmit = () => {
    if (!managerId) return;
    assignManager.mutate(
      { flatId, managerId },
      {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Server Failure",
              description: res.message ?? "Manager could not be assigned.",
              type: "error",
            });
            return;
          }
          toast.add({
            title: "Manager assigned",
            description: res.message ?? "Manager assigned successfully.",
            type: "success",
          });
          setOpen(false);
          setManagerId("");
          router.refresh();
        },
        onError: (err: any) => {
          toast.add({
            title: "Could not assign manager",
            description:
              err?.message ?? "Something went wrong. Please try again.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setManagerId("");
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <UserPlusIcon aria-hidden="true" />
        Assign manager
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign a manager</DialogTitle>
          <DialogDescription>
            Select an active manager to assign to this flat.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <Select
            value={managerId}
            onValueChange={(value) => setManagerId(value ?? "")}
            disabled={isLoading || managers.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoading ? "Loading managers..." : "Select a manager"
                }
              />
            </SelectTrigger>
            {managers.map((manager: FlatManager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.name}
                {manager.email ? ` (${manager.email})` : ""}
              </SelectItem>
            ))}
          </Select>
          {managers.length === 0 && !isLoading ? (
            <FieldError>No active managers found.</FieldError>
          ) : null}
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            onClick={handleSubmit}
            disabled={!managerId || assignManager.isPending}
          >
            {assignManager.isPending ? (
              <>
                <Spinner className="size-4" />
                Assigning...
              </>
            ) : (
              "Assign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
