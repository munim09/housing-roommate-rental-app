"use client";

import { cn } from "cn";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

interface ApplicationDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ApplicationDetailError({
  error,
  reset,
}: ApplicationDetailErrorProps) {
  useEffect(() => {
    console.error("[tenant/application] route crashed", error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-6" aria-hidden="true" />
      </span>

      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          This application failed to load
        </h1>
        <p className="max-w-md text-sm text-muted-foreground text-pretty">
          {error.message ??
            "An unexpected error occurred while loading the application."}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcwIcon aria-hidden="true" />
          Try again
        </Button>
        <Link
          href="/tenant/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
