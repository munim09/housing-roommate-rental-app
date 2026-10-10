"use client";

import {
    getTenantApplications,
    getTenantStays,
    type TenantApplication,
    type TenantStay,
    updateTenantApplicationStatus,
} from "@/api/tenant.api";
import { PaymentHistorySection } from "@/components/modules/tenant/payment-history-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/format";
import { RENTAL_TYPE_LABELS, type RentalType } from "@/types";
import { cn } from "cn";
import {
    CalendarRangeIcon,
    ClipboardListIcon,
    EyeIcon,
    HomeIcon,
    WalletCardsIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function rentalTypeLabel(value: string | null | undefined): string {
    if (!value) return "—";
    return (
        RENTAL_TYPE_LABELS[value as RentalType] ?? value.replaceAll("_", " ")
    );
}

/** Everything the drawer-less card can say about an application with no stay. */
function statusNote(appStatus: string): string {
    switch (appStatus) {
        case "PENDING":
            return "Waiting for the owner to review your application.";
        case "REJECTED":
            return "This application was not accepted.";
        case "WITHDRAWN":
            return "You withdrew this application.";
        case "EXPIRED":
            return "This application expired before a decision.";
        default:
            return "";
    }
}

function StatusField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            {children}
        </div>
    );
}

interface ApplicationCardProps {
    application: TenantApplication;
    stay?: TenantStay;
    busy: boolean;
    onWithdraw: (applicationId: string) => void;
}

/**
 * One application in the dashboard list. The two statuses get their own labelled
 * block — plain text badges were too easy to miss — and the only way into the
 * detail page is the explicit "View" button, so nothing turns into a link on
 * hover.
 */
function ApplicationCard({
    application,
    stay,
    busy,
    onWithdraw,
}: ApplicationCardProps) {
    const appStatus = (application.status ?? "").toUpperCase();
    const stayStatus = stay?.status ? stay.status.toUpperCase() : null;
    const title = application.advertisement?.title ?? "Application";
    const canWithdraw =
        appStatus === "PENDING" ||
        (appStatus === "APPROVED" && stayStatus === "WAITING_FOR_PAYMENT");
    const note = statusNote(appStatus);

    return (
        <li className="rounded-xl border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4"
                    >
                        <HomeIcon />
                    </span>
                    <div className="min-w-0 space-y-1">
                        <p className="text-sm leading-tight font-semibold">
                            {title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {rentalTypeLabel(application.rentalType)} · Applied{" "}
                            {formatDate(application.createdAt)}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/tenant/application/${application.id}`}
                    target="_blank"
                    aria-label={`View application for ${title}`}
                    className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "no-underline",
                    )}
                >
                    <EyeIcon aria-hidden="true" />
                    View
                </Link>
            </div>

            <div className="mt-4 grid gap-3 rounded-lg bg-muted/50 p-3 sm:grid-cols-2">
                <StatusField label="Application status">
                    <StatusBadge status={appStatus} />
                </StatusField>
                <StatusField label="Stay status">
                    {stay && stayStatus ? (
                        <StatusBadge status={stayStatus} />
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            No stay yet
                        </span>
                    )}
                </StatusField>
            </div>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                        Requested {formatDate(application.requestedStartDate)} →{" "}
                        {formatDate(application.requestedEndDate)}
                    </p>

                    {stay ? (
                        <p className="flex flex-wrap items-center gap-x-1.5">
                            <CalendarRangeIcon
                                aria-hidden="true"
                                className="size-3.5"
                            />
                            Stay {formatDate(stay.startDate)} →{" "}
                            {formatDate(stay.endDate)}
                            {stay.monthlyRent != null
                                ? ` · ${formatCurrency(Number(stay.monthlyRent))}/month`
                                : ""}
                        </p>
                    ) : note ? (
                        <p>{note}</p>
                    ) : null}

                    {stayStatus === "WAITING_FOR_PAYMENT" ? (
                        <p className="font-medium text-primary">
                            Rent is due — open the application to pay online.
                        </p>
                    ) : null}
                </div>

                {canWithdraw ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => onWithdraw(application.id)}
                    >
                        {busy ? <Spinner aria-hidden="true" /> : null}
                        Withdraw
                    </Button>
                ) : null}
            </div>
        </li>
    );
}

export function TenantDashboard() {
    const [activeTab, setActiveTab] = useState<"applications" | "payments">(
        "applications",
    );
    const [apps, setApps] = useState<TenantApplication[]>([]);
    const [stays, setStays] = useState<TenantStay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [applications, stayRecords] = await Promise.all([
                getTenantApplications(),
                getTenantStays(),
            ]);
            setApps(applications);
            setStays(stayRecords);
        } catch (e) {
            const message =
                e instanceof Error
                    ? e.message
                    : "Could not load your applications.";
            setError(message);
            toast.add({ title: "Error", description: message, type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleWithdraw = async (applicationId: string) => {
        setUpdating(applicationId);
        try {
            const res = await updateTenantApplicationStatus(
                applicationId,
                "WITHDRAWN",
            );
            if (res.success) {
                toast.add({
                    title: "Application withdrawn",
                    description:
                        res.message ?? "The application is now withdrawn.",
                    type: "success",
                });
                await load();
            } else {
                toast.add({
                    title: "Could not withdraw",
                    description: res.message ?? "Please try again.",
                    type: "error",
                });
            }
        } catch (e) {
            toast.add({
                title: "Error",
                description:
                    e instanceof Error ? e.message : "Please try again.",
                type: "error",
            });
        } finally {
            setUpdating(null);
        }
    };

    const stayMap = new Map(
        stays
            .filter((stay) => stay.applicationId)
            .map((stay) => [stay.applicationId as string, stay]),
    );

    return (
        <div className="space-y-4">
            <div
                role="tablist"
                aria-label="Dashboard sections"
                className="flex w-fit flex-wrap items-center gap-1 rounded-xl border bg-muted/40 p-1"
            >
                <Button
                    type="button"
                    variant={
                        activeTab === "applications" ? "secondary" : "ghost"
                    }
                    size="sm"
                    role="tab"
                    aria-selected={activeTab === "applications"}
                    onClick={() => setActiveTab("applications")}
                >
                    <ClipboardListIcon aria-hidden="true" />
                    Applications &amp; stays
                </Button>
                <Button
                    type="button"
                    variant={activeTab === "payments" ? "secondary" : "ghost"}
                    size="sm"
                    role="tab"
                    aria-selected={activeTab === "payments"}
                    onClick={() => setActiveTab("payments")}
                >
                    <WalletCardsIcon aria-hidden="true" />
                    Payment history
                </Button>
            </div>

            {activeTab === "payments" ? (
                <PaymentHistorySection />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Applications &amp; stays</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {loading
                                ? "Loading your applications…"
                                : `${apps.length} application${apps.length === 1 ? "" : "s"}`}
                        </p>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="grid gap-4">
                                {[0, 1, 2].map((index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 rounded-xl border p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                            <Skeleton className="h-7 w-20" />
                                        </div>
                                        <Skeleton className="h-14 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <ClipboardListIcon aria-hidden="true" />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        Could not load your applications
                                    </EmptyTitle>
                                    <EmptyDescription>{error}</EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void load()}
                                    >
                                        Try again
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        ) : apps.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <ClipboardListIcon aria-hidden="true" />
                                    </EmptyMedia>
                                    <EmptyTitle>No applications yet</EmptyTitle>
                                    <EmptyDescription>
                                        Apply for a listing and your
                                        applications, stays and rent invoices
                                        will appear here.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Link
                                        href="/listings"
                                        className={cn(
                                            buttonVariants({
                                                variant: "outline",
                                            }),
                                            "no-underline",
                                        )}
                                    >
                                        Browse listings
                                    </Link>
                                </EmptyContent>
                            </Empty>
                        ) : (
                            <ul className="grid gap-4 md:grid-cols-2">
                                {apps.map((application) => (
                                    <ApplicationCard
                                        key={application.id}
                                        application={application}
                                        stay={stayMap.get(application.id)}
                                        busy={updating === application.id}
                                        onWithdraw={handleWithdraw}
                                    />
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
