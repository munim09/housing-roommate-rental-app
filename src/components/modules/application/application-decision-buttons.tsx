"use client";

import { cn } from "cn";
import { CheckIcon, XIcon } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUpdateApplicationStatus } from "@/hooks/application.hook";
import type { OwnerManagerApplication } from "@/types";

type Decision = "APPROVED" | "REJECTED";

interface DecisionCopy {
  label: string;
  title: string;
  body: string;
  confirm: string;
  variant: "default" | "destructive";
}

const DECISION_COPY: Record<Decision, DecisionCopy> = {
  APPROVED: {
    label: "Approve",
    title: "Approve this application?",
    body: "Approving creates the stay record for this applicant; rent and utility invoices can then be raised against it.",
    confirm: "Approve application",
    variant: "default",
  },
  REJECTED: {
    label: "Reject",
    title: "Reject this application?",
    body: "The application stays visible in the list as rejected. The applicant can apply for another listing afterwards.",
    confirm: "Reject application",
    variant: "destructive",
  },
};

export interface ApplicationDecisionButtonsProps {
  application: OwnerManagerApplication;
  /** `xs` fits a table row, `sm` the review card inside the detail drawer. */
  size?: "xs" | "sm" | "default";
  className?: string;
}

/**
 * Approve / reject pair plus its confirm dialog. Used by both the table row and
 * the detail drawer, so a pending application can be decided from either place
 * without duplicating the mutation, its toasts or the copy.
 */
export function ApplicationDecisionButtons({
  application,
  size = "xs",
  className,
}: ApplicationDecisionButtonsProps) {
  const router = useRouter();
  const update = useUpdateApplicationStatus();
  const [decision, setDecision] = useState<Decision | null>(null);

  if (application.status !== "PENDING") return null;

  const applicantName = application.applicant?.name ?? "This applicant";
  const advertisementTitle = application.advertisement?.title ?? "this listing";

  function confirmDecision() {
    if (!decision) return;

    update.mutate(
      { applicationId: application.id, status: decision },
      {
        onSuccess: (response) => {
          if (!response.success) {
            toast.add({
              title: "Could not update the application",
              description:
                response.message ?? "The backend rejected the change.",
              type: "error",
            });
            return;
          }

          toast.add({
            title:
              decision === "APPROVED"
                ? "Application approved"
                : "Application rejected",
            description:
              response.message ?? `${applicantName} · ${advertisementTitle}`,
            type: "success",
          });
          setDecision(null);
          router.refresh();
        },
        onError: (error: Error) => {
          toast.add({
            title: "Could not update the application",
            description: error.message || "Something went wrong.",
            type: "error",
          });
        },
      },
    );
  }

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <Button
          type="button"
          size={size}
          variant="outline"
          disabled={update.isPending}
          onClick={() => setDecision("APPROVED")}
        >
          <CheckIcon aria-hidden="true" />
          {DECISION_COPY.APPROVED.label}
        </Button>
        <Button
          type="button"
          size={size}
          variant="destructive"
          disabled={update.isPending}
          onClick={() => setDecision("REJECTED")}
        >
          <XIcon aria-hidden="true" />
          {DECISION_COPY.REJECTED.label}
        </Button>
      </div>

      {decision ? (
        <Dialog
          open
          onOpenChange={(next) => {
            if (!next) setDecision(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{DECISION_COPY[decision].title}</DialogTitle>
              <DialogDescription>
                {DECISION_COPY[decision].body}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-1 rounded-lg bg-muted/60 p-3">
              <p className="text-sm font-medium">{applicantName}</p>
              <p className="text-xs text-muted-foreground">
                {advertisementTitle}
                {application.applicant?.email
                  ? ` · ${application.applicant.email}`
                  : ""}
              </p>
            </div>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                type="button"
                variant={DECISION_COPY[decision].variant}
                disabled={update.isPending}
                onClick={confirmDecision}
              >
                {update.isPending ? <Spinner aria-hidden="true" /> : null}
                {DECISION_COPY[decision].confirm}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
