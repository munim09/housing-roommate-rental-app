"use client";

import { UserXIcon } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useRevokeManager } from "@/hooks";

export function RevokeManagerDialog({ flatId }: { flatId: string }) {
  const router = useRouter();
  const revokeManager = useRevokeManager();
  const [open, setOpen] = useState(false);

  const handleRevoke = () => {
    revokeManager.mutate(
      { flatId },
      {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Server Failure",
              description: res.message ?? "Manager could not be revoked.",
              type: "error",
            });
            return;
          }
          toast.add({
            title: "Manager revoked",
            description:
              res.message ?? "Manager assignment revoked successfully.",
            type: "success",
          });
          setOpen(false);
          router.refresh();
        },
        onError: (err: any) => {
          toast.add({
            title: "Could not revoke manager",
            description:
              err?.message ?? "Something went wrong. Please try again.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <UserXIcon aria-hidden="true" />
        Revoke manager
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revoke manager</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke the active manager from this flat?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={revokeManager.isPending}
          >
            {revokeManager.isPending ? (
              <>
                <Spinner className="size-4" />
                Revoking...
              </>
            ) : (
              "Revoke"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
