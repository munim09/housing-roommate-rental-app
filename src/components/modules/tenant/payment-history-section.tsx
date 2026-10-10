"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { useCheckPayment, useTenantPaymentHistory } from "@/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PaymentHistoryItem, PaymentStatus } from "@/types";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CreditCardIcon,
    RefreshCwIcon,
    WalletCardsIcon,
} from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 10;

/**
 * Payments the gateway has not settled yet. These are the only rows the
 * backend lets you re-check with `GET /payments/check/:transactionReference`.
 */
const RETRYABLE_STATUSES: ReadonlySet<PaymentStatus> = new Set([
    "PENDING",
    "PROCESSING",
]);

const KIND_LABEL: Record<string, string> = {
    RENT: "Rent",
    UTILITY: "Utility",
};

function kindLabel(type: string | undefined): string {
    return (type && KIND_LABEL[type]) || type || "Payment";
}

function PaymentHistorySkeleton() {
    return (
        <div className="grid gap-4">
            {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-3 rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                        <Skeleton className="h-7 w-24" />
                    </div>
                    <Skeleton className="h-3 w-2/3" />
                </div>
            ))}
        </div>
    );
}

function PaymentHistoryRow({
    payment,
    checking,
    onCheck,
}: {
    payment: PaymentHistoryItem;
    checking: boolean;
    onCheck: (transactionReference: string) => void;
}) {
    const canCheck = RETRYABLE_STATUSES.has(payment.status);
    const settled = payment.status === "SUCCESS";

    return (
        <li className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{kindLabel(payment.type)}</p>
                        <StatusBadge status={payment.status} />
                        {/* {payment.invoice ? (
              <StatusBadge status={payment.invoice.status} />
            ) : null} */}
                    </div>

                    {payment.invoice ? (
                        <p className="text-sm text-muted-foreground">
                            Billing period{" "}
                            {formatDate(payment.invoice.billingPeriodStart)} –{" "}
                            {formatDate(payment.invoice.billingPeriodEnd)} · due{" "}
                            {formatDate(payment.invoice.dueDate)}
                        </p>
                    ) : null}

                    {payment.stay ? (
                        <p className="text-xs text-muted-foreground">
                            Stay {formatDate(payment.stay.startDate)} →{" "}
                            {formatDate(payment.stay.endDate)}
                        </p>
                    ) : null}

                    <p className="text-xs text-muted-foreground">
                        {settled && payment.paidAt
                            ? `Paid ${formatDate(payment.paidAt)}`
                            : `Attempted ${formatDate(payment.createdAt)}`}
                        {payment.failureReason
                            ? ` · ${payment.failureReason}`
                            : undefined}{" "}
                        · Ref {payment.transactionReference}
                    </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-lg font-semibold tabular-nums">
                        {formatCurrency(Number(payment.amount))}
                    </p>

                    {canCheck ? (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={checking}
                            onClick={() =>
                                onCheck(payment.transactionReference)
                            }
                        >
                            {checking ? (
                                <Spinner aria-hidden="true" />
                            ) : (
                                <RefreshCwIcon />
                            )}
                            Check payment
                        </Button>
                    ) : null}
                </div>
            </div>
        </li>
    );
}

/**
 * The signed-in tenant's payment history — every gateway attempt with its
 * invoice and stay. Pending attempts get a "Check payment" retry that asks the
 * gateway whether the transaction has actually settled, then refreshes the list.
 */
export function PaymentHistorySection() {
    const [page, setPage] = useState(1);
    const history = useTenantPaymentHistory({ page, limit: PAGE_SIZE });
    const check = useCheckPayment();

    const totalPages = history.data?.meta?.totalPages ?? 1;
    const hasNext = page < totalPages;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment history</CardTitle>
                <CardDescription>
                    Every payment attempt on your stays, with its gateway
                    outcome. Pending attempts can be re-checked against the
                    gateway.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {history.isPending ? (
                    <PaymentHistorySkeleton />
                ) : history.isError ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CreditCardIcon aria-hidden="true" />
                            </EmptyMedia>
                            <EmptyTitle>
                                Could not load your payment history
                            </EmptyTitle>
                            <EmptyDescription>
                                {history.error?.message ??
                                    "The payments service did not respond."}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void history.refetch()}
                            >
                                <RefreshCwIcon aria-hidden="true" />
                                Try again
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : history.data?.items.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <WalletCardsIcon aria-hidden="true" />
                            </EmptyMedia>
                            <EmptyTitle>No payments yet</EmptyTitle>
                            <EmptyDescription>
                                Once you pay an invoice, the attempts will
                                appear here with their gateway status.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <ul className="grid gap-3">
                        {(history.data?.items ?? []).map((payment) => (
                            <PaymentHistoryRow
                                key={payment.id}
                                payment={payment}
                                checking={
                                    check.isPending &&
                                    check.variables ===
                                        payment.transactionReference
                                }
                                onCheck={(transactionReference) =>
                                    check.mutate(transactionReference)
                                }
                            />
                        ))}
                    </ul>
                )}
            </CardContent>

            {(history.data?.items.length ?? 0) > 0 && totalPages > 1 ? (
                <CardFooter className="justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((current) => Math.max(1, current - 1))
                            }
                        >
                            <ChevronLeftIcon aria-hidden="true" />
                            Previous
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!hasNext}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Next
                            <ChevronRightIcon aria-hidden="true" />
                        </Button>
                    </div>
                </CardFooter>
            ) : null}
        </Card>
    );
}
